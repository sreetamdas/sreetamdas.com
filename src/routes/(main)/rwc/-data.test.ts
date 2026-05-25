import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { FALLBACK_RWC_BACKGROUND, loadRwcCodeSamples, resolveRwcEnv } from "./-data";

describe("resolveRwcEnv", () => {
	test("prefers runtime Cloudflare env over build env", () => {
		const runtimeEnv = {
			GITHUB_RWC_GIST_ID: "runtime_gist",
			GITHUB_TOKEN: "runtime_token",
		};
		const buildEnv = {
			GITHUB_RWC_GIST_ID: "build_gist",
			GITHUB_TOKEN: "build_token",
		};

		assert.deepEqual(resolveRwcEnv(runtimeEnv, buildEnv), {
			githubGistId: "runtime_gist",
			githubToken: "runtime_token",
		});
	});

	test("falls back to build env during static generation", () => {
		const buildEnv = {
			GITHUB_RWC_GIST_ID: "build_gist",
			GITHUB_TOKEN: "build_token",
		};

		assert.deepEqual(resolveRwcEnv(undefined, buildEnv), {
			githubGistId: "build_gist",
			githubToken: "build_token",
		});
	});
});

describe("loadRwcCodeSamples", () => {
	test("returns fallback data without fetching when gist id is missing", async () => {
		let fetched = false;

		const result = await loadRwcCodeSamples({
			githubGistId: undefined,
			githubToken: undefined,
			fetchGist: async () => {
				fetched = true;
				return { files: {} };
			},
			getHighlighter: async () => createHighlighter(),
		});

		assert.equal(fetched, false);
		assert.deepEqual(result, {
			all_solutions: [],
			background_color: FALLBACK_RWC_BACKGROUND,
		});
	});

	test("returns fallback data when gist fetching fails", async () => {
		const result = await loadRwcCodeSamples({
			githubGistId: "gist_123",
			githubToken: undefined,
			fetchGist: async () => {
				throw new Error("GitHub unavailable");
			},
			getHighlighter: async () => createHighlighter(),
		});

		assert.deepEqual(result, {
			all_solutions: [],
			background_color: FALLBACK_RWC_BACKGROUND,
		});
	});

	test("builds highlighted solutions from gist files", async () => {
		const result = await loadRwcCodeSamples({
			githubGistId: "gist_123",
			githubToken: "token_123",
			fetchGist: async (gistId, token) => {
				assert.equal(gistId, "gist_123");
				assert.equal(token, "token_123");

				return {
					files: {
						"Day 01.ts": {
							content: "const answer = 42;",
							filename: "Day 01.ts",
							language: "TypeScript",
						},
						"README.md": {
							content: null,
							filename: "README.md",
							language: "Markdown",
						},
						script: {
							content: "console.log('ok')",
							filename: "script",
							language: undefined,
						},
					},
				};
			},
			getHighlighter: async () => createHighlighter(),
		});

		assert.equal(result.background_color, "#123456");
		assert.deepEqual(result.all_solutions, [
			{
				html: `<code data-lang="typescript">const answer = 42;</code>`,
				slug: "day_01_ts",
				filename: "Day 01.ts",
				lang: "typescript",
			},
			{
				html: `<code data-lang="js">console.log('ok')</code>`,
				slug: "script",
				filename: "script",
				lang: "js",
			},
		]);
	});
});

function createHighlighter() {
	return {
		getTheme: () => ({ bg: "#123456" }),
		codeToHtml: (code: string, options: { lang: string }) => {
			return `<pre class="shiki"><code data-lang="${options.lang}">${code}</code></pre>`;
		},
	};
}
