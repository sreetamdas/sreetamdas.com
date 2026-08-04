import { createServerFn } from "@tanstack/react-start";

import { fetchGist } from "@/lib/domains/GitHub/fetchGist";
import { getSlimKarmaHighlighter } from "@/lib/domains/shiki/highlighter";

import {
	buildHighlightedCodeResponse,
	loadCachedHighlightedCodeResponse,
	loadRwcCodeSamples,
	resolveRwcEnv,
	RWC_CACHE_NAME,
	type RwcCache,
} from "./-data";

export const getHighlightedCode = createServerFn({ method: "GET" }).handler(async () => {
	const { githubGistId, githubToken } = resolveRwcEnv();
	const load = () =>
		loadRwcCodeSamples({
			githubGistId,
			githubToken,
			fetchGist,
			getHighlighter: getSlimKarmaHighlighter,
		});

	if (typeof caches === "undefined") {
		return buildHighlightedCodeResponse(await load());
	}

	let cache: RwcCache | undefined;
	try {
		cache = await caches.open(RWC_CACHE_NAME);
	} catch {
		cache = undefined;
	}

	if (!cache) {
		return buildHighlightedCodeResponse(await load());
	}

	return loadCachedHighlightedCodeResponse({ cache, load });
});
