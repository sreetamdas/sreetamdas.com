import { expect, test } from "@playwright/test";

/*
 * `/rwc` is prerendered, so its highlighted code is fetched from the browser
 * through the `/_serverFn/` transport on every mount. This spec asserts that
 * the server function's cache headers actually reach the wire through that
 * transport. The server-function hash is a build-time artifact, so it is not
 * hardcoded here; instead the response is discovered from the page's own
 * network activity.
 *
 * Other `/_serverFn/` calls share the transport (e.g. the page metrics on the
 * same route), so responses are discriminated by their payload rather than by
 * URL: the RWC response is the only one whose JSON contains `all_solutions`.
 */

// The expected header values intentionally duplicate `src/lib/cacheHeaders`
// instead of importing through the `@/` alias. No other e2e spec imports app
// source, and hardcoding keeps this a true wire-level assertion: a regression
// in the constants themselves would otherwise be masked by importing them.
const RWC_BROWSER_CACHE_CONTROL = "public, max-age=0, stale-while-revalidate=86400";
const RWC_EDGE_CACHE_CONTROL = "public, max-age=3600, stale-while-revalidate=86400";

interface ServerFnHit {
	status: number;
	cacheControl: string | null;
	edgeCacheControl: string | null;
}

test("serves /rwc highlighted code through the server function with correct cache headers", async ({
	page,
}) => {
	const hits: Array<ServerFnHit> = [];
	page.on("response", (response) => {
		if (!response.url().includes("/_serverFn/")) return;

		void response
			.text()
			.catch(() => "")
			.then((body) => {
				if (!body.includes("all_solutions")) return;

				hits.push({
					status: response.status(),
					cacheControl: response.headers()["cache-control"] ?? null,
					edgeCacheControl: response.headers()["cloudflare-cdn-cache-control"] ?? null,
				});
			});
	});

	await page.goto("/rwc");

	await expect
		.poll(() => hits.filter((hit) => hit.status === 200).length, {
			message: "the RWC server function should return its JSON payload on mount",
		})
		.toBeGreaterThan(0);

	const hit = hits.find((h) => h.status === 200);
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
