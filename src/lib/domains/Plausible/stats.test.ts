import { beforeEach, describe, expect, test, vi } from "vitest";

type TestPlausibleEnv = Pick<Partial<CloudflareEnv>, "PLAUSIBLE_API_KEY" | "PLAUSIBLE_SITE_ID">;

const cloudflare = vi.hoisted<{ env: TestPlausibleEnv }>(() => ({ env: {} }));

vi.mock("cloudflare:workers", () => cloudflare);

import { fetchPlausibleStats, getPlausibleApiKey, getPlausibleSiteId } from "./stats";

describe("Plausible stats", () => {
	beforeEach(() => {
		setPlausibleEnv({});
	});

	test("reads supported runtime env names", () => {
		setPlausibleEnv({ PLAUSIBLE_API_KEY: "api_key" });
		expect(getPlausibleApiKey()).toBe("api_key");

		setPlausibleEnv({ PLAUSIBLE_SITE_ID: "example.com" });
		expect(getPlausibleSiteId()).toBe("example.com");

		setPlausibleEnv({});
		expect(getPlausibleSiteId()).toBe("sreetamdas.com");
	});

	test("returns a missing-config state without calling Plausible", async () => {
		const fetchMock = stubFetch(async () => {
			return new Response("unexpected", { status: 500 });
		});

		setPlausibleEnv({ PLAUSIBLE_SITE_ID: "example.com" });
		const stats = await fetchPlausibleStats();

		expect(fetchMock).not.toHaveBeenCalled();
		expect(stats.status).toBe("missing-config");
		expect(stats.siteId).toBe("example.com");
		expect(stats.overview.visitors).toBe(0);
	});

	test("queries and maps Plausible v2 stats", async () => {
		const requestedBodies: Array<unknown> = [];
		stubFetch(async (_input, init) => {
			const body = parseJsonBody(init?.body);
			requestedBodies.push(body);

			if (hasDimension(body, "event:page")) {
				return Response.json({
					results: [
						{ dimensions: ["/"], metrics: [12, 34] },
						{ dimensions: ["/blog"], metrics: [5, 8] },
					],
				});
			}

			if (hasDimension(body, "visit:entry_page")) {
				return Response.json({
					results: [{ dimensions: ["/blog"], metrics: [11, 55] }],
				});
			}

			if (hasDimension(body, "visit:exit_page")) {
				return Response.json({
					results: [{ dimensions: ["/uses"], metrics: [7, 35] }],
				});
			}

			if (hasDimension(body, "visit:source")) {
				return Response.json({
					results: [
						{ dimensions: ["GitHub"], metrics: [9, 60] },
						{ dimensions: [""], metrics: [4, 40] },
					],
				});
			}

			if (hasDimension(body, "visit:referrer")) {
				return Response.json({
					results: [{ dimensions: ["github.com"], metrics: [8, 50] }],
				});
			}

			if (hasDimension(body, "visit:channel")) {
				return Response.json({
					results: [{ dimensions: ["Organic Search"], metrics: [6, 30] }],
				});
			}

			if (hasDimension(body, "visit:country_name")) {
				return Response.json({
					results: [{ dimensions: ["India", "IN"], metrics: [5, 25] }],
				});
			}

			if (hasDimension(body, "visit:city_name")) {
				return Response.json({
					results: [{ dimensions: ["Bengaluru"], metrics: [4, 20] }],
				});
			}

			if (hasDimension(body, "visit:device")) {
				return Response.json({
					results: [{ dimensions: ["Desktop"], metrics: [10, 80] }],
				});
			}

			if (hasDimension(body, "visit:browser")) {
				return Response.json({
					results: [{ dimensions: ["Chrome"], metrics: [9, 72] }],
				});
			}

			if (hasDimension(body, "visit:os")) {
				return Response.json({
					results: [{ dimensions: ["Mac"], metrics: [8, 64] }],
				});
			}

			if (hasDimension(body, "time")) {
				return Response.json({
					results: [
						{ dimensions: ["2026-05-27"], metrics: [3] },
						{ dimensions: ["2026-05-28"], metrics: [6] },
					],
				});
			}

			return Response.json({
				results: [{ dimensions: [], metrics: [42, 50, 100, 2, 45.5, 75] }],
			});
		});

		setPlausibleEnv({ PLAUSIBLE_API_KEY: "test_key", PLAUSIBLE_SITE_ID: "example.com" });
		const stats = await fetchPlausibleStats("91d");

		expect(requestedBodies).toHaveLength(13);
		expect(stats.status).toBe("ready");
		expect(stats.period).toBe("91d");
		expect(stats.overview).toEqual({
			visitors: 42,
			visits: 50,
			pageviews: 100,
			viewsPerVisit: 2,
			bounceRate: 45.5,
			visitDuration: 75,
		});
		expect(stats.topPages[0]).toEqual({ path: "/", visitors: 12, pageviews: 34 });
		expect(stats.entryPages[0]).toEqual({ name: "/blog", visitors: 11, percentage: 55 });
		expect(stats.exitPages[0]).toEqual({ name: "/uses", visitors: 7, percentage: 35 });
		expect(stats.topSources[1]).toEqual({ name: "Direct / None", visitors: 4, percentage: 40 });
		expect(stats.referrers[0]).toEqual({ name: "github.com", visitors: 8, percentage: 50 });
		expect(stats.channels[0]).toEqual({ name: "Organic Search", visitors: 6, percentage: 30 });
		expect(stats.countries[0]).toEqual({
			name: "India",
			code: "IN",
			visitors: 5,
			percentage: 25,
		});
		expect(stats.cities[0]).toEqual({ name: "Bengaluru", visitors: 4, percentage: 20 });
		expect(stats.devices[0]).toEqual({ name: "Desktop", visitors: 10, percentage: 80 });
		expect(stats.browsers[0]).toEqual({ name: "Chrome", visitors: 9, percentage: 72 });
		expect(stats.operatingSystems[0]).toEqual({ name: "Mac", visitors: 8, percentage: 64 });
		expect(stats.timeline[1]).toEqual({ date: "2026-05-28", visitors: 6 });
	});

	test("returns an unavailable state when Plausible returns an error", async () => {
		stubFetch(async () => new Response("nope", { status: 401 }));

		setPlausibleEnv({ PLAUSIBLE_API_KEY: "bad_key" });
		const stats = await fetchPlausibleStats();

		expect(stats.status).toBe("unavailable");
		expect(stats.topPages).toEqual([]);
	});

	test("coalesces null metrics to zero instead of collapsing the dashboard", async () => {
		stubFetch(async (_input, init) => {
			const body = parseJsonBody(init?.body);
			if (hasNoDimensions(body)) {
				return Response.json({
					results: [{ dimensions: [], metrics: [10, 20, 30, null, null, null] }],
				});
			}
			return Response.json({ results: [{ dimensions: ["x"], metrics: [1, null] }] });
		});

		setPlausibleEnv({ PLAUSIBLE_API_KEY: "test_key", PLAUSIBLE_SITE_ID: "example.com" });
		const stats = await fetchPlausibleStats();

		expect(stats.status).toBe("ready");
		expect(stats.overview.visitors).toBe(10);
		expect(stats.overview.viewsPerVisit).toBe(0);
		expect(stats.overview.bounceRate).toBe(0);
		expect(stats.overview.visitDuration).toBe(0);
		expect(stats.topPages[0]?.pageviews).toBe(0);
	});

	test("returns an unavailable state when Plausible returns an unexpected shape", async () => {
		stubFetch(async () => Response.json({ unexpected: true }));

		setPlausibleEnv({ PLAUSIBLE_API_KEY: "test_key" });
		const stats = await fetchPlausibleStats();

		expect(stats.status).toBe("unavailable");
	});
});

function stubFetch(implementation: typeof fetch) {
	const fetchMock = vi.fn(implementation);
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

function hasNoDimensions(value: unknown): boolean {
	return (
		typeof value === "object" &&
		value !== null &&
		(!("dimensions" in value) || value.dimensions === undefined)
	);
}

function setPlausibleEnv(value: TestPlausibleEnv) {
	cloudflare.env.PLAUSIBLE_API_KEY = value.PLAUSIBLE_API_KEY;
	cloudflare.env.PLAUSIBLE_SITE_ID = value.PLAUSIBLE_SITE_ID;
}

function parseJsonBody(body: BodyInit | null | undefined): unknown {
	if (typeof body !== "string") {
		return undefined;
	}

	return JSON.parse(body);
}

function hasDimension(value: unknown, dimension: string): boolean {
	if (typeof value !== "object" || value === null || !("dimensions" in value)) {
		return false;
	}

	return Array.isArray(value.dimensions) && value.dimensions.includes(dimension);
}
