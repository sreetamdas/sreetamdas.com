/**
 * Guards the prerendered HTML that Workers Assets serves directly.
 *
 * TanStack Start's prerenderer logs a failure and retries, but the build still
 * exits successfully — so a page that 500s during prerender is silently dropped
 * from the build output. The sitemap plugin always writes
 * dist/client/pages.json listing every page it was asked to prerender, so this
 * script cross-checks that list against the emitted HTML.
 *
 * This is the failure mode that took /rwc down on 2026-09-12: the page 500'd
 * during prerender and was dropped from the deploy, and because it then had no
 * static asset, every request fell through to the Worker at runtime.
 *
 * Runs as part of `pnpm build` / `build:ci`, so a missing page fails the build
 * (and therefore the Workers deploy) instead of shipping silently.
 */
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const CLIENT_DIR = "dist/client";
const PAGES_MANIFEST = join(CLIENT_DIR, "pages.json");

function parsePrerenderedPagePaths(value: unknown): Array<string> {
	if (typeof value !== "object" || value === null || !("pages" in value)) {
		throw new Error(`[prerender-check] ${PAGES_MANIFEST} has no "pages" array`);
	}

	const { pages } = value;
	if (!Array.isArray(pages)) {
		throw new Error(`[prerender-check] ${PAGES_MANIFEST} "pages" is not an array`);
	}

	const paths: Array<string> = [];
	for (const page of pages) {
		if (typeof page !== "object" || page === null || !("path" in page)) {
			continue;
		}

		const { path } = page;
		if (typeof path === "string") {
			paths.push(path);
		}
	}

	return paths;
}

/**
 * Mirrors `prerender.filter` in vite.config.ts: pages whose path looks like a
 * file (crawled asset links such as /resume.pdf) are never rendered to HTML, so
 * they must not be checked for.
 */
function expectedHtmlFile(pagePath: string): string | undefined {
	if (/\.[a-z0-9]+$/i.test(pagePath)) {
		return undefined;
	}

	const [pathname = ""] = pagePath.split(/[?#]/);
	const relative = pathname.replace(/^\/+/, "");
	if (relative === "") {
		return "index.html";
	}

	return relative.endsWith("/") ? join(relative, "index.html") : `${relative}.html`;
}

const manifest: unknown = JSON.parse(await readFile(PAGES_MANIFEST, "utf-8"));

const expected = new Map<string, string>();
for (const path of parsePrerenderedPagePaths(manifest)) {
	const file = expectedHtmlFile(path);
	if (file !== undefined) {
		expected.set(file, path);
	}
}

const missing: Array<string> = [];
for (const [file, path] of expected) {
	const output = join(CLIENT_DIR, file);
	try {
		const stats = await stat(output);
		if (stats.size === 0) {
			missing.push(`${path} (${output} is empty)`);
		}
	} catch {
		missing.push(`${path} (${output} was not written)`);
	}
}

if (missing.length > 0) {
	throw new Error(
		`[prerender-check] prerender output is incomplete, so these pages would ship ` +
			`without a static asset and fall through to the Worker:\n` +
			missing.map((entry) => `  - ${entry}`).join("\n") +
			`\nLook for the failing page in the "[prerender]" output above.`,
	);
}

process.stdout.write(`[prerender-check] all ${expected.size} prerendered pages have HTML output\n`);
