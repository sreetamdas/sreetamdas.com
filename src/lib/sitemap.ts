/**
 * Sitemap normalization shared by the post-build script (`scripts/normalize-sitemap.ts`)
 * and its unit tests.
 *
 * TanStack Start's prerender crawler discovers URLs by following every `<a href>`
 * in rendered HTML, so the generated sitemap can contain trailing-slash duplicates
 * (`/blog` and `/blog/`) and paths that `robots.txt` disallows (the `/foobar`
 * easter egg). Both confuse Google Search Console, so we normalize the generated
 * file in place after the build.
 */

/**
 * Canonicalizes a sitemap `<loc>`: drops the query string and hash (so filter
 * params like `/stats?period=7d` collapse to one entry) and strips a trailing
 * slash, collapsing the root to the bare origin.
 */
export function normalizeLoc(loc: string): string {
	let url: URL;
	try {
		url = new URL(loc);
	} catch {
		return loc;
	}

	url.search = "";
	url.hash = "";

	if (url.pathname === "/") {
		return url.origin;
	}

	url.pathname = url.pathname.replace(/\/+$/, "");
	return url.toString();
}

function locPathname(loc: string): string | null {
	try {
		return new URL(loc).pathname;
	} catch {
		return null;
	}
}

function isDisallowed(loc: string, disallow: Array<string>): boolean {
	if (disallow.length === 0) return false;

	const pathname = locPathname(loc);
	if (pathname === null) return false;

	return disallow.some((rule) => pathname === rule || pathname.startsWith(rule));
}

/** Parses `Disallow:` path prefixes out of a robots.txt file. */
export function parseRobotsDisallow(robotsTxt: string): Array<string> {
	const rules = new Set<string>();
	const regex = /^\s*Disallow:\s*(\S+)\s*$/gim;
	let match: RegExpExecArray | null;
	while ((match = regex.exec(robotsTxt)) !== null) {
		const path = match[1];
		if (path && path !== "/") {
			rules.add(path.replace(/\/+$/, "") || "/");
		}
	}
	return Array.from(rules);
}

export type NormalizeSitemapResult = {
	xml: string;
	kept: number;
	removed: number;
};

/**
 * Normalizes every `<loc>` in a sitemap: strips trailing slashes, drops URLs whose
 * path is disallowed by robots.txt, and removes duplicates (keeping the first entry).
 * Non-`<url>` content (XML declaration, `<urlset>` wrapper, comments) is preserved.
 */
export function normalizeSitemapXml(
	xml: string,
	options: { disallow?: Array<string> } = {},
): NormalizeSitemapResult {
	const disallow = options.disallow ?? [];
	const seen = new Set<string>();
	let kept = 0;
	let removed = 0;

	// Capture each <url> block with its leading indentation and trailing newline so a
	// removed block leaves no orphaned whitespace, keeping the transform idempotent.
	const xml_normalized = xml.replace(
		/([ \t]*)<url>([\s\S]*?)<\/url>[ \t]*(\n?)/g,
		(_full, indent: string, inner: string, newline: string) => {
			const locMatch = inner.match(/<loc>([\s\S]*?)<\/loc>/);
			if (!locMatch) {
				kept += 1;
				return `${indent}<url>${inner}</url>${newline}`;
			}

			const normalizedLoc = normalizeLoc(locMatch[1].trim());

			if (isDisallowed(normalizedLoc, disallow) || seen.has(normalizedLoc)) {
				removed += 1;
				return "";
			}

			seen.add(normalizedLoc);
			kept += 1;
			const normalizedInner = inner.replace(/<loc>[\s\S]*?<\/loc>/, `<loc>${normalizedLoc}</loc>`);
			return `${indent}<url>${normalizedInner}</url>${newline}`;
		},
	);

	return { xml: xml_normalized, kept, removed };
}
