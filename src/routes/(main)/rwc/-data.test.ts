import { describe, expect, test } from "vitest";

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

		expect(resolveRwcEnv(runtimeEnv, buildEnv, undefined)).toEqual({
			githubGistId: "runtime_gist",
			githubToken: "runtime_token",
		});
	});

	test("falls back to build env during static generation", () => {
		const buildEnv = {
			GITHUB_RWC_GIST_ID: "build_gist",
			GITHUB_TOKEN: "build_token",
		};

		expect(resolveRwcEnv(undefined, buildEnv, undefined)).toEqual({
			githubGistId: "build_gist",
			githubToken: "build_token",
		});
	});

	test("falls back to public Vite env for gist id when runtime and build env are missing", () => {
		const viteEnv = {
			VITE_GITHUB_RWC_GIST_ID: "vite_gist",
			VITE_GITHUB_TOKEN: "vite_token",
		};

		expect(resolveRwcEnv(undefined, undefined, viteEnv)).toEqual({
			githubGistId: "vite_gist",
			githubToken: undefined,
		});
	});

	test("does not read token values from public Vite env", () => {
		const viteEnv = {
			VITE_GITHUB_TOKEN: "vite_token",
		};

		expect(resolveRwcEnv(undefined, undefined, viteEnv)).toEqual({
			githubGistId: undefined,
			githubToken: undefined,
		});
	});

	test("returns undefined gist id when env is missing", () => {
		expect(resolveRwcEnv(undefined, undefined, undefined)).toEqual({
			githubGistId: undefined,
			githubToken: undefined,
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

		expect(fetched).toBe(false);
		expect(result).toEqual({
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

		expect(result).toEqual({
			all_solutions: [],
			background_color: FALLBACK_RWC_BACKGROUND,
		});
	});

	test("builds highlighted solutions from gist files", async () => {
		const result = await loadRwcCodeSamples({
			githubGistId: "gist_123",
			githubToken: "token_123",
			fetchGist: async (gistId, token) => {
				expect(gistId).toBe("gist_123");
				expect(token).toBe("token_123");

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

		expect(result.background_color).toBe("#123456");
		expect(result.all_solutions).toEqual([
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
