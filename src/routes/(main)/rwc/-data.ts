/**
 * Remote Widget Catalogue data loader. RWC source files live in a GitHub gist
 * and are highlighted at build/prerender time when env is available, with a
 * small fallback payload for previews that do not have the gist configured.
 */
import { env } from "cloudflare:workers";

export const FALLBACK_RWC_BACKGROUND = "#17181c";

export type RWCSolution = {
	html: string;
	slug: string;
	filename: string | undefined;
	lang: string;
};

export type RWCCodeSamples = {
	all_solutions: Array<RWCSolution>;
	background_color: string;
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
