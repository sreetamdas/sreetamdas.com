/**
 * Build-time script for the /rwc ("Real World Code") page.
 *
 * Fetches a GitHub Gist, runs Shiki syntax highlighting on each file,
 * and writes the result to .velite/rwc.json so the route can import
 * it as static data — no runtime API calls needed.
 *
 * Requires VITE_GITHUB_TOKEN and VITE_GITHUB_RWC_GIST_ID in the
 * environment. Gracefully produces an empty result when either is missing
 * (e.g. in CI without secrets or local dev without the gist ID).
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { getSlimKarmaHighlighter } from "../src/lib/domains/shiki/highlighter";
import { renderCodeBlockToHtml } from "../src/lib/domains/shiki/plugin";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const VELITE_DIR = resolve(ROOT, ".velite");

const GITHUB_API_BASE_URL = "https://api.github.com";
const FALLBACK_RWC_BACKGROUND = "#17181c";

type RwcSolution = {
	html: string;
	slug: string;
	filename: string | undefined;
	lang: string;
};

type RwcData = {
	all_solutions: Array<RwcSolution>;
	background_color: string;
};

const EMPTY_RESULT: RwcData = {
	all_solutions: [],
	background_color: FALLBACK_RWC_BACKGROUND,
};

function getGitHubToken(): string | undefined {
	return process.env.VITE_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;
}

function getGistId(): string | undefined {
	return process.env.VITE_GITHUB_RWC_GIST_ID ?? process.env.GITHUB_RWC_GIST_ID;
}

async function fetchGist(gistId: string) {
	const token = getGitHubToken();
	const headers: Record<string, string> = {
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
		"User-Agent": "sreetamdas.com",
	};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const response = await fetch(`${GITHUB_API_BASE_URL}/gists/${gistId}`, { headers });
	if (!response.ok) {
		throw new Error(`Failed to fetch gist: ${response.status} ${response.statusText}`);
	}

	return response.json() as Promise<{
		files: Record<string, { content?: string; filename?: string; language?: string } | undefined>;
	}>;
}

async function main() {
	if (!existsSync(VELITE_DIR)) {
		mkdirSync(VELITE_DIR, { recursive: true });
	}

	const gistId = getGistId();

	if (!gistId) {
		process.stdout.write("  Skipped .velite/rwc.json (VITE_GITHUB_RWC_GIST_ID not set)\n");
		writeFileSync(resolve(VELITE_DIR, "rwc.json"), JSON.stringify(EMPTY_RESULT), "utf-8");
		return;
	}

	let gist: Awaited<ReturnType<typeof fetchGist>>;
	try {
		gist = await fetchGist(gistId);
	} catch (err) {
		process.stderr.write(
			`  Warning: could not fetch RWC gist (${err instanceof Error ? err.message : err}), writing empty data\n`,
		);
		writeFileSync(resolve(VELITE_DIR, "rwc.json"), JSON.stringify(EMPTY_RESULT), "utf-8");
		return;
	}

	if (!gist.files || Object.keys(gist.files).length === 0) {
		writeFileSync(resolve(VELITE_DIR, "rwc.json"), JSON.stringify(EMPTY_RESULT), "utf-8");
		return;
	}

	const files = Object.values(gist.files);
	const highlighter = await getSlimKarmaHighlighter();
	const background_color = highlighter.getTheme("karma").bg;

	const all_solutions: Array<RwcSolution> = [];

	for (const file of files) {
		const code = file?.content;
		if (code == null) continue;

		const slug = file?.filename?.replaceAll(/[\s.]/g, "_").toLowerCase() ?? "";
		const filename = file?.filename;
		const lang = file?.language?.toLowerCase() ?? "js";

		const html = renderCodeBlockToHtml(highlighter, code, lang, null);
		if (html === null) continue;

		const cleaned_html = html.replace(/(^<pre [^>]*>)/, "").replace(/(<\/pre>$)/, "");

		all_solutions.push({ html: cleaned_html, slug, filename, lang });
	}

	const result: RwcData = { all_solutions, background_color };

	writeFileSync(resolve(VELITE_DIR, "rwc.json"), JSON.stringify(result), "utf-8");
	process.stdout.write(`  Generated .velite/rwc.json (${all_solutions.length} code samples)\n`);
}

main();
