/**
 * Post-content build script.
 *
 * Generates sitemap.xml and rss/feed.xml from generated content
 * collections and writes them into `public/` so they are served as static
 * assets by Cloudflare Workers.
 *
 * Sitemap is auto-generated from the TanStack Router route tree so it
 * stays in sync with actual file routes — no hardcoded list.
 *
 * Run after `build:content-collections`.
 */
import { allBlogPosts, allRootPages } from "content-collections";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { BUTTONDOWN_EMAIL_MOCKS } from "../src/routes/(main)/newsletter/-mocks";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PUBLIC = resolve(ROOT, "public");

const SITE_URL = "https://sreetamdas.com";
const OWNER_NAME = "Sreetam Das";
const BUTTONDOWN_BASE_URL = "https://api.buttondown.email/v1";

// ---------------------------------------------------------------------------
// Route tree parsing
// ---------------------------------------------------------------------------

function extractRoutesFromRouteTree(): Array<string> {
	const routeTreePath = resolve(ROOT, "src/routeTree.gen.ts");
	const content = readFileSync(routeTreePath, "utf-8");

	// Extract keys from `FileRoutesByTo` interface
	const match = content.match(/export interface FileRoutesByTo\s*\{([^}]+)\}/s);
	if (!match) {
		throw new Error("Could not find FileRoutesByTo in routeTree.gen.ts");
	}

	const body = match[1];
	const routes: Array<string> = [];

	// Match lines like: `  '/about': typeof mainAboutRoute`
	const lineRegex = /'([^']+)':\s*typeof\s+\w+/g;
	let m;
	while ((m = lineRegex.exec(body)) !== null) {
		routes.push(m[1]);
	}

	return routes;
}

function isVisibleRoute(path: string): boolean {
	// Exclude API routes
	if (path.startsWith("/api/")) return false;
	if (path.startsWith("/prxy/")) return false;

	// Exclude internal/presentation routes
	if (path.startsWith("/slides")) return false;
	if (path.startsWith("/foobar")) return false;

	// Exclude raw param patterns (we expand them via content collections/newsletter data)
	if (path.includes("/$")) return false;

	return true;
}

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

type RootPage = {
	title: string;
	published: boolean;
	skip_page?: boolean;
	page_path: string;
	published_at: string;
	updated_at?: string;
};

type NewsletterEmail = {
	slug: string;
	subject: string;
	publish_date: string;
};

// ---------------------------------------------------------------------------
// Sitemap
// ---------------------------------------------------------------------------

type SitemapEntry = {
	loc: string;
	lastmod?: string;
	changefreq?: string;
	priority?: string;
};

function generateSitemap(
	routes: Array<string>,
	blogPosts: Array<BlogPost>,
	rootPages: Array<RootPage>,
	newsletterEmails: Array<NewsletterEmail>,
): string {
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

	// Auto-discovered file routes
	for (const path of routes) {
		add(path);
	}

	// Content collection pages (these override or supplement file routes)
	for (const page of rootPages) {
		if (!page.published || page.skip_page) continue;
		add(page.page_path, page.updated_at ?? page.published_at);
	}

	for (const post of blogPosts) {
		if (!post.published) continue;
		add(post.url ?? post.page_path, post.updated_at ?? post.published_at);
	}

	for (const email of newsletterEmails) {
		add(`/newsletter/${email.slug}`, email.publish_date);
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

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`;
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

async function fetchNewsletterEmails(): Promise<Array<NewsletterEmail>> {
	try {
		const response = await fetch(`${BUTTONDOWN_BASE_URL}/emails`);
		if (!response.ok) {
			return BUTTONDOWN_EMAIL_MOCKS.results.map(({ slug, subject, publish_date }) => ({
				slug,
				subject,
				publish_date,
			}));
		}
		const data = (await response.json()) as {
			results: Array<{ slug: string; subject: string; publish_date: string }>;
		};
		return data.results.map(({ slug, subject, publish_date }) => ({
			slug,
			subject,
			publish_date,
		}));
	} catch {
		return BUTTONDOWN_EMAIL_MOCKS.results.map(({ slug, subject, publish_date }) => ({
			slug,
			subject,
			publish_date,
		}));
	}
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
	const blogPosts = allBlogPosts as Array<BlogPost>;
	const rootPages = allRootPages as Array<RootPage>;
	const newsletterEmails = await fetchNewsletterEmails();

	// Discover routes from TanStack Router's generated route tree
	const rawRoutes = extractRoutesFromRouteTree();
	const fileRoutes = rawRoutes.filter(isVisibleRoute);

	// Sitemap
	const sitemap = generateSitemap(fileRoutes, blogPosts, rootPages, newsletterEmails);
	writeFileSync(resolve(PUBLIC, "sitemap.xml"), sitemap, "utf-8");
	process.stdout.write(
		`  Generated public/sitemap.xml (${fileRoutes.length} file routes, ${blogPosts.filter((p) => p.published).length} blog posts, ${rootPages.filter((p) => p.published && !p.skip_page).length} pages, ${newsletterEmails.length} newsletter emails)\n`,
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
