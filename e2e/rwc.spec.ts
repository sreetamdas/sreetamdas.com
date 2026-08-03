import { expect, test } from "@playwright/test";

/*
 * `/rwc` is prerendered, so its highlighted code is fetched from the browser
 * through the `/_serverFn/` transport on every mount. This spec asserts that
 * the server function's cache headers actually reach the wire through that
 * transport. The server-function hash is a build-time artifact, so it is not
 * hardcoded here; instead the response is discovered from the page's own
 * network activity.
 */

const RWC_BROWSER_CACHE_CONTROL = "public, max-age=0, stale-while-revalidate=86400";
const RWC_EDGE_CACHE_CONTROL = "public, max-age=3600, stale-while-revalidate=86400";

interface ServerFnHit {
	status: number;
	cacheControl: string | null;
	edgeCacheControl: string | null;
	contentType: string | null;
}

test("serves /rwc highlighted code through the server function with correct cache headers", async ({
	page,
}) => {
	const hits: Array<ServerFnHit> = [];
	page.on("response", (response) => {
		if (response.url().includes("/_serverFn/")) {
			hits.push({
				status: response.status(),
				cacheControl: response.headers()["cache-control"] ?? null,
				edgeCacheControl: response.headers()["cloudflare-cdn-cache-control"] ?? null,
				contentType: response.headers()["content-type"] ?? null,
			});
		}
	});

	await page.goto("/rwc");

	await expect
		.poll(
			() =>
				hits.filter((hit) => hit.status === 200 && hit.contentType?.includes("application/json"))
					.length,
			{
				message: "the RWC server function should return its JSON payload on mount",
			},
		)
		.toBeGreaterThan(0);

	const hit = hits.find((h) => h.status === 200 && h.contentType?.includes("application/json"));
	if (!hit) {
		throw new Error("expected at least one successful RWC server function response");
	}

	// The payload is cacheable only when the gist was freshly loaded; the
	// fallback path (GitHub unavailable) must never be cached. Either way the
	// header must survive the `_serverFn` transport.
	const cacheControl = hit.cacheControl ?? "";
	expect([RWC_BROWSER_CACHE_CONTROL, "no-store"]).toContain(cacheControl);

	if (cacheControl === RWC_BROWSER_CACHE_CONTROL) {
		expect(hit.edgeCacheControl).toBe(RWC_EDGE_CACHE_CONTROL);
	} else {
		expect(hit.edgeCacheControl).toBeNull();
	}
});
