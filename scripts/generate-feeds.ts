/**
 * Post-content build script.
 *
 * Generates sitemap.xml and rss/feed.xml from the Velite-built content
 * collections and writes them into `public/` so they are served as static
 * assets by Cloudflare Workers.
 *
 * Run after `build:content` (Velite) so the .velite output is available.
 */
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PUBLIC = resolve(ROOT, "public");
const VELITE_DIR = resolve(ROOT, ".velite");

const SITE_URL = "https://sreetamdas.com";
const OWNER_NAME = "Sreetam Das";

// ---------------------------------------------------------------------------
// Load Velite JSON output
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

type RootPage = {
	title: string;
	published: boolean;
	skip_page?: boolean;
	page_path: string;
	published_at: string;
	updated_at?: string;
};

function loadJson<T>(filename: string): T {
	const filepath = resolve(VELITE_DIR, filename);
	if (!existsSync(filepath)) {
		throw new Error(`${filepath} not found — run "pnpm build:content" before generating feeds.`);
	}
	const content = readFileSync(filepath, "utf-8");
	return JSON.parse(content) as T;
}

// ---------------------------------------------------------------------------
// Sitemap
// ---------------------------------------------------------------------------

type SitemapEntry = {
	loc: string;
	lastmod?: string;
	changefreq?: string;
	priority?: string;
};

function generateSitemap(blogPosts: Array<BlogPost>, rootPages: Array<RootPage>): string {
	const staticRoutes = ["/", "/blog", "/karma", "/keebs", "/newsletter", "/fancy-pants", "/resume"];

	const seen = new Set<string>();
	const entries: Array<SitemapEntry> = [];

	const add = (path: string, lastmod?: string) => {
		if (seen.has(path)) return;
		seen.add(path);
		entries.push({
			loc: `${SITE_URL}${path}`,
			...(lastmod ? { lastmod } : {}),
			changefreq: "weekly",
			priority: "0.7",
		});
	};

	for (const path of staticRoutes) {
		add(path);
	}

	for (const page of rootPages) {
		if (!page.published || page.skip_page) continue;
		add(page.page_path, page.updated_at ?? page.published_at);
	}

	for (const post of blogPosts) {
		if (!post.published) continue;
		add(post.url ?? post.page_path, post.updated_at ?? post.published_at);
	}

	const urlEntries = entries
		.map(({ loc, lastmod, changefreq, priority }) => {
			const parts = [`<loc>${escapeXml(loc)}</loc>`];
			if (lastmod) parts.push(`<lastmod>${lastmod}</lastmod>`);
			if (changefreq) parts.push(`<changefreq>${changefreq}</changefreq>`);
			if (priority) parts.push(`<priority>${priority}</priority>`);
			return `  <url>\n    ${parts.join("\n    ")}\n  </url>`;
		})
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

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

			return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
		})
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${OWNER_NAME}&apos;s Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Blog posts by ${OWNER_NAME}</description>
    <language>en-us</language>
    <lastBuildDate>${lastUpdated}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
	const blogPosts = loadJson<Array<BlogPost>>("blogPosts.json");
	const rootPages = loadJson<Array<RootPage>>("rootPages.json");

	// Sitemap
	const sitemap = generateSitemap(blogPosts, rootPages);
	writeFileSync(resolve(PUBLIC, "sitemap.xml"), sitemap, "utf-8");
	process.stdout.write(
		`  Generated public/sitemap.xml (${blogPosts.filter((p) => p.published).length} blog posts, ${rootPages.filter((p) => p.published && !p.skip_page).length} pages)\n`,
	);

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
