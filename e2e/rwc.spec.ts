import { expect, test, type Page } from "@playwright/test";

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

/**
 * `/rwc` is prerendered from a build-time snapshot, but preview deploys ship an
 * empty one, so the highlighted samples (and therefore the `#slug` anchors they
 * render) only exist once the client-side refetch resolves. The browser's
 * initial fragment scroll runs against markup that has no targets yet, so the
 * route re-attempts the scroll after the samples arrive.
 *
 * These specs stub the server function with a fixed payload so they assert that
 * recovery deterministically, independently of the live gist's contents, and so
 * both fragment targets sit far enough below the fold that "the target is off
 * screen" is unambiguous. Without that headroom the recovery would correctly do
 * nothing and a spec could pass without scrolling anything.
 */
const FILLER_SAMPLES = Array.from({ length: 8 }, (_, index) => {
	const n = String(index + 1).padStart(3, "0");
	const html = Array.from(
		{ length: 6 },
		(_, line) => `<span class="line">sample ${n} line ${line + 1}</span>`,
	).join("");
	return { html, slug: `p${n}_ts`, filename: `p${n}.ts`, lang: "ts" };
});

const DEEP_LINK_SAMPLE = {
	html: '<span class="line">deep link</span>',
	slug: "p900_ts",
	filename: "p900.ts",
	lang: "ts",
};

// Gist filenames become slugs, so `+` reaches the DOM as an element id. It is a
// legal id but an invalid CSS selector, which is why the route looks the fragment
// up by id instead of via `querySelector`.
const SELECTOR_UNSAFE_SAMPLE = {
	html: '<span class="line">selector unsafe</span>',
	slug: "c++_cpp",
	filename: "C++.cpp",
	lang: "cpp",
};

const STUBBED_SAMPLES = [...FILLER_SAMPLES, DEEP_LINK_SAMPLE, SELECTOR_UNSAFE_SAMPLE];

async function stubRwcSamples(page: Page, { delayMs = 250 }: { delayMs?: number } = {}) {
	await page.route("**/_serverFn/**", async (route) => {
		// Perform the real request so the response body can identify which server
		// function this is; `route.request().response()` is null inside a handler
		// because interception happens before the response arrives.
		const response = await route.fetch();
		const body = await response.text().catch(() => "");

		// Other `/_serverFn/` calls share the transport; only RWC's payload carries
		// `all_solutions`. Everything else passes through untouched.
		if (!body.includes("all_solutions")) {
			await route.fulfill({ response });
			return;
		}

		// Swap only `all_solutions` and keep the real response (headers included):
		// the transport carries its own metadata on this response, and a
		// synthesized one is not accepted as a server-function result.
		const payload: unknown = JSON.parse(body);
		if (typeof payload !== "object" || payload === null || !("all_solutions" in payload)) {
			await route.fulfill({ response });
			return;
		}
		const patched = { ...payload, all_solutions: STUBBED_SAMPLES };

		await new Promise((resolve) => setTimeout(resolve, delayMs));
		await route.fulfill({ response, body: JSON.stringify(patched) });
	});
}

test("scrolls to a deep-linked sample after the client-side refetch resolves", async ({ page }) => {
	await stubRwcSamples(page);

	// The recovery only matters when prerender shipped no anchors. Assert that
	// against the served prerendered HTML rather than against the live DOM, which
	// would just be inferring the precondition from a race with the stub delay.
	const shell = await page.request.get("/rwc");
	expect(await shell.text()).not.toContain(`id="${DEEP_LINK_SAMPLE.slug}"`);

	await page.goto("/rwc#p900_ts");

	await expect(page.locator("#p900_ts")).toBeAttached();

	// The page must actually have moved: without recovery it is still at the top
	// with the target thousands of pixels below, so a "target clears the header"
	// assertion alone would pass vacuously.
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

	// `scroll-pt-16` on <html> is what clears the 60px sticky header for every
	// scrollIntoView on the site, so the recovered heading must come to rest at
	// or below the header rather than tucked behind it. `scroll-smooth` is also
	// global, so poll for the settled position instead of sampling mid-animation.
	await expect
		.poll(
			() =>
				page.evaluate(() => {
					const target = document.getElementById("p900_ts");
					const header = document.querySelector("header");
					if (!(target instanceof HTMLElement) || !(header instanceof HTMLElement)) return null;
					return Math.round(
						target.getBoundingClientRect().top - header.getBoundingClientRect().bottom,
					);
				}),
			{ message: "the deep-linked heading should come to rest clear of the sticky header" },
		)
		.toBeGreaterThanOrEqual(0);
});

test("recovers a deep link whose slug is not a valid CSS selector", async ({ page }) => {
	await stubRwcSamples(page);

	const errors: Array<string> = [];
	page.on("pageerror", (error) => errors.push(error.message));

	await page.goto("/rwc#c++_cpp");

	// A `querySelector(window.location.hash)` implementation throws a SyntaxError
	// here, which would leave the page unscrolled and surface as a page error.
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
	expect(errors).toEqual([]);
});

test("recovers the deep link when the page is already scrolled", async ({ page }) => {
	// TanStack Router skips restoring the window scroll when a navigation carries
	// a hash, so arriving at /rwc#slug from another route leaves a stale non-zero
	// `scrollY` with the real target still off screen. A short viewport makes even
	// the empty prerendered shell scrollable, which is what lets that state be
	// reproduced here.
	await page.setViewportSize({ width: 500, height: 320 });
	await stubRwcSamples(page, { delayMs: 1500 });

	await page.goto("/rwc#p900_ts");

	await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 10_000 }).toBe(0);
	await page.evaluate(() => window.scrollTo(0, 40));

	// The samples arrive with the page already scrolled away from the top. The
	// recovery has to notice that the target is not on screen rather than reading
	// `scrollY` as "already handled".
	await expect(page.locator("#p900_ts")).toBeAttached({ timeout: 10_000 });
	await expect
		.poll(() => page.evaluate(() => window.scrollY), { timeout: 10_000 })
		.toBeGreaterThan(40);
});
