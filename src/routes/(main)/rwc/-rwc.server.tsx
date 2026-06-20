import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";

import { fetchGist } from "@/lib/domains/GitHub/fetchGist";
import { getSlimKarmaHighlighter } from "@/lib/domains/shiki/highlighter";

import { loadRwcCodeSamples, resolveRwcEnv } from "./-data";

export const getHighlightedCode = createServerFn({ method: "GET" })
	.middleware([staticFunctionMiddleware])
	.handler(async () => {
		const { githubGistId, githubToken } = resolveRwcEnv();

		const result = await loadRwcCodeSamples({
			githubGistId,
			githubToken,
			fetchGist,
			getHighlighter: getSlimKarmaHighlighter,
		});

		return result;
	});
