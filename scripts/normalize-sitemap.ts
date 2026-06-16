/**
 * Post-build script.
 *
 * Normalizes the sitemap that TanStack Start generates during `vite build`.
 * Its prerender crawler follows every `<a href>` it renders, so the raw sitemap
 * picks up trailing-slash duplicates, query-param duplicates (`/stats?period=`),
 * and the robots-disallowed `/foobar` easter egg links.
 *
 * This rewrites the BUILD ARTIFACT that actually ships (`dist/client/sitemap.xml`,
 * served by the Cloudflare Worker) — not the source `public/sitemap.xml` — to
 * canonicalize locs, drop disallowed paths, drop fallback mock newsletter URLs,
 * and de-duplicate.
 *
 * Runs after `vite build` (see the `build` script in package.json).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { MOCK_NEWSLETTER_SLUGS } from "../src/lib/domains/Buttondown/mocks.ts";
import { normalizeSitemapXml, parseRobotsDisallow } from "../src/lib/sitemap.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SITEMAP_PATH = resolve(ROOT, "dist/client/sitemap.xml");
const ROBOTS_PATH = resolve(ROOT, "public/robots.txt");

function main() {
	if (!existsSync(SITEMAP_PATH)) {
		// The sitemap plugin is enabled, so a successful build must emit this file.
		// Failing loudly avoids silently shipping an un-normalized sitemap if the
		// build output path ever changes.
		process.stderr.write(
			`  Expected built sitemap at ${SITEMAP_PATH} but none was found. ` +
				`Did the TanStack Start build output path change?\n`,
		);
		process.exit(1);
	}

	const robotsDisallow = existsSync(ROBOTS_PATH)
		? parseRobotsDisallow(readFileSync(ROBOTS_PATH, "utf-8"))
		: [];
	const mockNewsletterPaths = MOCK_NEWSLETTER_SLUGS.map((slug) => `/newsletter/${slug}`);
	const disallow = [...robotsDisallow, ...mockNewsletterPaths];

	const original = readFileSync(SITEMAP_PATH, "utf-8");
	const { xml, kept, removed } = normalizeSitemapXml(original, { disallow });

	if (xml !== original) {
		writeFileSync(SITEMAP_PATH, xml, "utf-8");
	}

	process.stdout.write(
		`  Normalized dist/client/sitemap.xml (${kept} urls kept, ${removed} removed; disallow: ${
			disallow.join(", ") || "none"
		})\n`,
	);
}

main();
