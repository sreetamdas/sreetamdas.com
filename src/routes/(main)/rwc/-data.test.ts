import { describe, expect, test } from "vitest";

import { RWC_BROWSER_CACHE_CONTROL, RWC_EDGE_CACHE_CONTROL } from "@/lib/cacheHeaders";

import {
	buildHighlightedCodeResponse,
	FALLBACK_RWC_BACKGROUND,
	loadCachedHighlightedCodeResponse,
	loadRwcCodeSamples,
	resolveRwcEnv,
} from "./-data";
import { parseRwcCodeSamples } from "./-data.shared";

describe("resolveRwcEnv", () => {
	test("reads GitHub settings from Cloudflare env", () => {
		const runtimeEnv = {
			GITHUB_RWC_GIST_ID: "runtime_gist",
			GITHUB_TOKEN: "runtime_token",
		};

		expect(resolveRwcEnv(runtimeEnv)).toEqual({
			githubGistId: "runtime_gist",
			githubToken: "runtime_token",
		});
	});

	test("returns undefined gist id when env is missing", () => {
		expect(resolveRwcEnv(undefined)).toEqual({
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

describe("buildHighlightedCodeResponse", () => {
	test("returns the payload as JSON with edge cache headers", async () => {
		const payload = {
			all_solutions: [
				{
					html: "<code>answer</code>",
					slug: "answer",
					filename: "answer.ts",
					lang: "typescript",
				},
			],
			background_color: FALLBACK_RWC_BACKGROUND,
		};

		const response = buildHighlightedCodeResponse(payload);

		expect(response.headers.get("content-type")).toBe("application/json");
		expect(response.headers.get("cache-control")).toBe(RWC_BROWSER_CACHE_CONTROL);
		expect(response.headers.get("cloudflare-cdn-cache-control")).toBe(RWC_EDGE_CACHE_CONTROL);
		await expect(response.json()).resolves.toEqual(payload);
	});

	test("does not cache fallback payloads", async () => {
		const response = buildHighlightedCodeResponse({
			all_solutions: [],
			background_color: FALLBACK_RWC_BACKGROUND,
		});

		expect(response.headers.get("cache-control")).toBe("no-store");
		expect(response.headers.get("cloudflare-cdn-cache-control")).toBeNull();
	});
});

describe("parseRwcCodeSamples", () => {
	test("accepts a valid payload", () => {
		const payload = {
			all_solutions: [],
			background_color: FALLBACK_RWC_BACKGROUND,
		};

		expect(parseRwcCodeSamples(payload)).toEqual(payload);
	});

	test("rejects malformed payloads", () => {
		expect(() =>
			parseRwcCodeSamples({
				all_solutions: [{ html: "<code>answer</code>" }],
				background_color: FALLBACK_RWC_BACKGROUND,
			}),
		).toThrow("Invalid RWC code samples payload");
	});
});

describe("loadCachedHighlightedCodeResponse", () => {
	test("serves a valid cached payload without reloading the gist", async () => {
		const payload = {
			all_solutions: [
				{
					html: "<code>cached</code>",
					slug: "cached",
					filename: "cached.ts",
					lang: "typescript",
				},
			],
			background_color: "#123456",
		};
		let loaded = false;

		const response = await loadCachedHighlightedCodeResponse({
			cache: {
				match: async () => new Response(JSON.stringify(payload)),
				put: async (_request: Request, _response: Response) => undefined,
			},
			load: async () => {
				loaded = true;
				return payload;
			},
		});

		expect(loaded).toBe(false);
		await expect(response.json()).resolves.toEqual(payload);
	});

	test("stores successful payloads but not fallback payloads", async () => {
		const writes: Array<Response> = [];
		const cache = {
			match: async () => undefined,
			put: async (_request: Request, response: Response) => {
				writes.push(response);
			},
		};
		const payload = {
			all_solutions: [
				{
					html: "<code>fresh</code>",
					slug: "fresh",
					filename: "fresh.ts",
					lang: "typescript",
				},
			],
			background_color: "#123456",
		};

		await loadCachedHighlightedCodeResponse({ cache, load: async () => payload });
		expect(writes).toHaveLength(1);
		expect(writes[0]?.headers.get("cache-control")).toBe("public, max-age=3600");

		await loadCachedHighlightedCodeResponse({
			cache,
			load: async () => ({
				all_solutions: [],
				background_color: FALLBACK_RWC_BACKGROUND,
			}),
		});
		expect(writes).toHaveLength(1);
	});

	test("returns fresh data when the cache is unavailable", async () => {
		const payload = {
			all_solutions: [
				{
					html: "<code>fresh</code>",
					slug: "fresh",
					filename: "fresh.ts",
					lang: "typescript",
				},
			],
			background_color: "#123456",
		};

		const response = await loadCachedHighlightedCodeResponse({
			cache: {
				match: async () => {
					throw new Error("Cache unavailable");
				},
				put: async () => {
					throw new Error("Cache unavailable");
				},
			},
			load: async () => payload,
		});

		await expect(response.json()).resolves.toEqual(payload);
	});
});
