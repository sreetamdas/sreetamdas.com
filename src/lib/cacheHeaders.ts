/*
 * Shared HTML cache policies for prerendered pages and Worker-rendered route
 * fallbacks. Browsers revalidate documents every time, while Cloudflare keeps a
 * short edge-fresh window before falling back to stale-while-revalidate.
 */

export const HTML_BROWSER_CACHE_CONTROL = "public, max-age=0, stale-while-revalidate=3600";
export const HTML_EDGE_CACHE_CONTROL = "public, max-age=300, stale-while-revalidate=3600";

export const STATS_BROWSER_CACHE_CONTROL = "public, max-age=0, stale-while-revalidate=600";
export const STATS_EDGE_CACHE_CONTROL = "public, max-age=60, stale-while-revalidate=600";

// RWC: the highlighted gist is re-fetched from the CDN on every page load
// (browser max-age=0) while Cloudflare keeps it fresh for a day and revalidates
// in the background via stale-while-revalidate — so new editions show up within
// ~24h without a deploy.
export const RWC_BROWSER_CACHE_CONTROL = "public, max-age=0, stale-while-revalidate=86400";
export const RWC_EDGE_CACHE_CONTROL = "public, max-age=86400, stale-while-revalidate=86400";

export const HTML_CACHE_HEADERS = {
	"cache-control": HTML_BROWSER_CACHE_CONTROL,
	"cloudflare-cdn-cache-control": HTML_EDGE_CACHE_CONTROL,
};

export const STATS_CACHE_HEADERS = {
	"cache-control": STATS_BROWSER_CACHE_CONTROL,
	"cloudflare-cdn-cache-control": STATS_EDGE_CACHE_CONTROL,
};

export const RWC_CACHE_HEADERS = {
	"cache-control": RWC_BROWSER_CACHE_CONTROL,
	"cloudflare-cdn-cache-control": RWC_EDGE_CACHE_CONTROL,
};
