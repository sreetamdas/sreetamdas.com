/**
 * Remote Widget Catalogue data loader. RWC source files live in a GitHub gist
 * and are highlighted for the build/prerendered shell and request-time refreshes,
 * with a small fallback payload for previews or temporary GitHub failures.
 */
import { env } from "cloudflare:workers";

import { RWC_CACHE_HEADERS, RWC_EDGE_CACHE_TTL_SECONDS } from "@/lib/cacheHeaders";

import { parseRwcCodeSamples, type RWCCodeSamples, type RWCSolution } from "./-data.shared";

export type { RWCCodeSamples, RWCSolution } from "./-data.shared";

export const FALLBACK_RWC_BACKGROUND = "#17181c";
export const RWC_CACHE_NAME = "rwc-highlighted-code";
export const RWC_CACHE_KEY = "https://internal.cache/rwc-highlighted-code";

export type RwcCache = {
	match(request: Request): Promise<Response | undefined>;
	put(request: Request, response: Response): Promise<void>;
};

type RwcGistFile = {
	content?: string | null;
	filename?: string | null;
	language?: string | null;
};

type RwcGist = {
	files?: Record<string, RwcGistFile | null> | null;
};

type RwcHighlighter = {
	getTheme: (theme: "karma") => { bg: string };
	codeToHtml: (code: string, options: { theme: "karma"; lang: string }) => string;
};

type LoadRwcCodeSamplesOptions = {
	githubGistId: string | undefined;
	githubToken: string | undefined;
	fetchGist: (gistId: string, githubToken: string | undefined) => Promise<RwcGist>;
	getHighlighter: () => Promise<RwcHighlighter>;
};

const fallbackRwcCodeSamples: RWCCodeSamples = {
	all_solutions: [],
	background_color: FALLBACK_RWC_BACKGROUND,
};

type RwcEnv = Pick<CloudflareEnv, "GITHUB_RWC_GIST_ID" | "GITHUB_TOKEN">;

export function resolveRwcEnv(runtimeEnv: RwcEnv | undefined = env) {
	return {
		githubGistId: runtimeEnv?.GITHUB_RWC_GIST_ID || undefined,
		githubToken: runtimeEnv?.GITHUB_TOKEN || undefined,
	};
}

export async function loadRwcCodeSamples({
	githubGistId,
	githubToken,
	fetchGist,
	getHighlighter,
}: LoadRwcCodeSamplesOptions): Promise<RWCCodeSamples> {
	if (!githubGistId) {
		return fallbackRwcCodeSamples;
	}

	let gist: RwcGist;
	try {
		gist = await fetchGist(githubGistId, githubToken);
	} catch {
		return fallbackRwcCodeSamples;
	}

	const files = Object.values(gist.files ?? {});
	if (files.length === 0) {
		return fallbackRwcCodeSamples;
	}

	const karmaHighlighter = await getHighlighter();
	const background_color = karmaHighlighter.getTheme("karma").bg;

	const all_solutions = files.flatMap((file) => {
		const code = file?.content;
		const filename = file?.filename ?? undefined;
		if (code == null || filename == null) {
			return [];
		}

		const slug = filename.replaceAll(/[\s.]/g, "_").toLowerCase();
		const lang = file?.language?.toLowerCase() ?? "js";
		const html = karmaHighlighter.codeToHtml(code, { theme: "karma", lang });
		const cleaned_html = html.replace(/(^<pre [^>]*>)/, "").replace(/(<\/pre>$)/, "");

		return [{ html: cleaned_html, slug, filename, lang }];
	});

	return { all_solutions, background_color };
}

function isCacheableRwcCodeSamples(result: RWCCodeSamples): boolean {
	return result.all_solutions.length > 0;
}

async function readCachedRwcCodeSamples(
	cache: RwcCache,
	cacheKey: Request,
): Promise<RWCCodeSamples | undefined> {
	let cached: Response | undefined;
	try {
		cached = await cache.match(cacheKey);
	} catch {
		return undefined;
	}

	if (!cached) {
		return undefined;
	}

	try {
		const result: unknown = await cached.json();
		const parsed = parseRwcCodeSamples(result);
		return isCacheableRwcCodeSamples(parsed) ? parsed : undefined;
	} catch {
		return undefined;
	}
}

async function writeCachedRwcCodeSamples(
	cache: RwcCache,
	cacheKey: Request,
	result: RWCCodeSamples,
): Promise<void> {
	try {
		await cache.put(
			cacheKey,
			new Response(JSON.stringify(result), {
				headers: {
					"content-type": "application/json",
					"cache-control": `public, max-age=${RWC_EDGE_CACHE_TTL_SECONDS}`,
				},
			}),
		);
	} catch {
		return;
	}
}

export async function loadCachedHighlightedCodeResponse({
	cache,
	load,
}: {
	cache: RwcCache;
	load: () => Promise<RWCCodeSamples>;
}): Promise<Response> {
	const cacheKey = new Request(RWC_CACHE_KEY);
	const cached = await readCachedRwcCodeSamples(cache, cacheKey);
	if (cached) {
		return buildHighlightedCodeResponse(cached);
	}

	const result = await load();
	if (isCacheableRwcCodeSamples(result)) {
		await writeCachedRwcCodeSamples(cache, cacheKey, result);
	}

	return buildHighlightedCodeResponse(result);
}

/**
 * Wraps the highlighted gist payload in a JSON response carrying the RWC cache
 * policy. Empty fallback payloads are explicitly non-cacheable so a transient
 * GitHub failure cannot poison the runtime cache.
 */
export function buildHighlightedCodeResponse(result: RWCCodeSamples): Response {
	const cacheHeaders = isCacheableRwcCodeSamples(result)
		? RWC_CACHE_HEADERS
		: { "cache-control": "no-store" };

	return new Response(JSON.stringify(result), {
		headers: {
			"content-type": "application/json",
			...cacheHeaders,
		},
	});
}
