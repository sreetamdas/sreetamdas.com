/**
 * Post-content build script.
 *
 * Generates rss/feed.xml from generated content collections and writes
 * it into `public/` so it is served as a static asset by Cloudflare Workers.
 *
 * Sitemap generation is handled by TanStack Start's built-in sitemap support.
 *
 * Run after `build:content-collections`.
 */
import { allBlogPosts } from "content-collections";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PUBLIC = resolve(ROOT, "public");

function resolveSiteUrl(): string {
	const explicitSiteUrl = process.env.VITE_SITE_URL ?? process.env.SITE_URL;
	if (explicitSiteUrl) {
		return explicitSiteUrl.replace(/\/$/, "");
	}

	return process.env.CLOUDFLARE_ENV === "staging"
		? "https://staging.sreetamdas.com"
		: "https://sreetamdas.com";
}

const SITE_URL = resolveSiteUrl();
const OWNER_NAME = "Sreetam Das";

// ---------------------------------------------------------------------------
// Content types
// ---------------------------------------------------------------------------

type BlogPost = {
	title: string;
	description: string;
	published: boolean;
	url?: string;
	page_path: string;
	published_at: string;
	updated_at?: string;
};

// ---------------------------------------------------------------------------
// RSS Feed
// ---------------------------------------------------------------------------

function generateRssFeed(blogPosts: Array<BlogPost>): string {
	const published = blogPosts
		.filter((p) => p.published)
		.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

	const lastUpdated =
		published.length > 0
			? new Date(published[0].updated_at ?? published[0].published_at).toUTCString()
			: new Date().toUTCString();

	const items = published
		.map((post) => {
			const link = `${SITE_URL}${post.url ?? post.page_path}`;
			const pubDate = new Date(post.published_at).toUTCString();

			return `    <item>\n      <title>${escapeXml(post.title)}</title>\n      <link>${escapeXml(link)}</link>\n      <guid isPermaLink="true">${escapeXml(link)}</guid>\n      <description>${escapeXml(post.description)}</description>\n      <pubDate>${pubDate}</pubDate>\n    </item>`;
		})
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n    <title>${OWNER_NAME}&apos;s Blog</title>\n    <link>${SITE_URL}/blog</link>\n    <description>Blog posts by ${OWNER_NAME}</description>\n    <language>en-us</language>\n    <lastBuildDate>${lastUpdated}</lastBuildDate>\n    <atom:link href="${SITE_URL}/rss/feed.xml" rel="self" type="application/rss+xml" />\n${items}\n  </channel>\n</rss>`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeXml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

async function main() {
	const blogPosts = allBlogPosts as Array<BlogPost>;

	// RSS
	const rssDir = resolve(PUBLIC, "rss");
	if (!existsSync(rssDir)) {
		mkdirSync(rssDir, { recursive: true });
	}
	const rss = generateRssFeed(blogPosts);
	writeFileSync(resolve(rssDir, "feed.xml"), rss, "utf-8");
	process.stdout.write(
		`  Generated public/rss/feed.xml (${blogPosts.filter((p) => p.published).length} items)\n`,
	);
}

main();
