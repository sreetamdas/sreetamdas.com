import { describe, expect, test } from "vitest";

import { MOCK_NEWSLETTER_SLUGS } from "@/lib/domains/Buttondown/mocks";

import { normalizeLoc, normalizeSitemapXml, parseRobotsDisallow } from "./sitemap";

describe("normalizeLoc", () => {
	test("strips a trailing slash", () => {
		expect(normalizeLoc("https://sreetamdas.com/blog/")).toBe("https://sreetamdas.com/blog");
	});

	test("leaves a slashless path untouched", () => {
		expect(normalizeLoc("https://sreetamdas.com/blog")).toBe("https://sreetamdas.com/blog");
	});

	test("collapses the root to the bare origin", () => {
		expect(normalizeLoc("https://sreetamdas.com/")).toBe("https://sreetamdas.com");
	});

	test("drops the query string and hash", () => {
		expect(normalizeLoc("https://sreetamdas.com/stats?period=7d")).toBe(
			"https://sreetamdas.com/stats",
		);
		expect(normalizeLoc("https://sreetamdas.com/stats#top")).toBe("https://sreetamdas.com/stats");
	});
});

describe("parseRobotsDisallow", () => {
	test("extracts disallowed prefixes and ignores root", () => {
		const robots = [
			"User-agent: *",
			"Disallow: /foobar",
			"Disallow: /foobar/",
			"Disallow: /aoc",
			"Allow: /",
			"Disallow: /",
		].join("\n");
		expect(parseRobotsDisallow(robots).sort()).toEqual(["/aoc", "/foobar"]);
	});
});

const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://sreetamdas.com/blog/</loc>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://sreetamdas.com/blog</loc>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://sreetamdas.com/foobar</loc>
  </url>
  <url>
    <loc>https://sreetamdas.com/foobar/teapot</loc>
  </url>
  <url>
    <loc>https://sreetamdas.com/about</loc>
  </url>
</urlset>`;

describe("normalizeSitemapXml", () => {
	test("dedupes trailing-slash variants and drops disallowed paths", () => {
		const result = normalizeSitemapXml(SITEMAP, { disallow: ["/foobar"] });

		const locs = [...result.xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
		expect(locs).toEqual(["https://sreetamdas.com/blog", "https://sreetamdas.com/about"]);
		expect(result.kept).toBe(2);
		expect(result.removed).toBe(3);
	});

	test("preserves the urlset wrapper and xml declaration", () => {
		const result = normalizeSitemapXml(SITEMAP, { disallow: [] });
		expect(result.xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
		expect(result.xml.trimEnd().endsWith("</urlset>")).toBe(true);
	});

	test("keeps the first entry's metadata when deduping", () => {
		const result = normalizeSitemapXml(SITEMAP, { disallow: ["/foobar"] });
		expect(result.xml).toContain("<priority>0.7</priority>");
	});

	test("dedupes query-param variants of the same page", () => {
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://sreetamdas.com/stats</loc>
  </url>
  <url>
    <loc>https://sreetamdas.com/stats?period=7d</loc>
  </url>
  <url>
    <loc>https://sreetamdas.com/stats?period=all</loc>
  </url>
</urlset>`;
		const result = normalizeSitemapXml(xml, {});
		const locs = [...result.xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
		expect(locs).toEqual(["https://sreetamdas.com/stats"]);
		expect(result.removed).toBe(2);
	});

	test("excludes fallback mock newsletter URLs (keyless build cannot ship mocks)", () => {
		expect(MOCK_NEWSLETTER_SLUGS.length).toBeGreaterThan(0);

		const mockUrls = MOCK_NEWSLETTER_SLUGS.map(
			(slug) => `  <url>\n    <loc>https://sreetamdas.com/newsletter/${slug}</loc>\n  </url>`,
		).join("\n");
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://sreetamdas.com/newsletter/a-real-issue</loc>
  </url>
${mockUrls}
</urlset>`;

		const disallow = MOCK_NEWSLETTER_SLUGS.map((slug) => `/newsletter/${slug}`);
		const result = normalizeSitemapXml(xml, { disallow });

		for (const slug of MOCK_NEWSLETTER_SLUGS) {
			expect(result.xml).not.toContain(slug);
		}
		expect(result.xml).toContain("/newsletter/a-real-issue");
	});

	test("is a no-op for an already-clean sitemap", () => {
		const clean = normalizeSitemapXml(SITEMAP, { disallow: ["/foobar"] }).xml;
		const again = normalizeSitemapXml(clean, { disallow: ["/foobar"] });
		expect(again.removed).toBe(0);
		expect(again.xml).toBe(clean);
	});
});
