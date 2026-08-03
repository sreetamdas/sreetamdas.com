import { createServerFn } from "@tanstack/react-start";

import { fetchGist } from "@/lib/domains/GitHub/fetchGist";
import { getSlimKarmaHighlighter } from "@/lib/domains/shiki/highlighter";

import { buildHighlightedCodeResponse, loadRwcCodeSamples, resolveRwcEnv } from "./-data";

// Runs at request time (rather than being prerendered into a static asset) so
// the response can be cached at the edge with stale-while-revalidate and pick
// up gist changes daily without a deploy.
export const getHighlightedCode = createServerFn({ method: "GET" }).handler(async () => {
	const { githubGistId, githubToken } = resolveRwcEnv();

	const result = await loadRwcCodeSamples({
		githubGistId,
		githubToken,
		fetchGist,
		getHighlighter: getSlimKarmaHighlighter,
	});

	return buildHighlightedCodeResponse(result);
});
