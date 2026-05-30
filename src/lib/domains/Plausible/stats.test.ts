import { describe, expect, test } from "vitest";

import { fetchPlausibleStats, getPlausibleApiKey, getPlausibleSiteId } from "./stats";

describe("Plausible stats", () => {
	test("reads supported runtime env names", () => {
		expect(getPlausibleApiKey({ PLAUSIBLE_STATS_API_KEY: "stats_key" })).toBe("stats_key");
		expect(getPlausibleApiKey({ PLAUSIBLE_API_KEY: "api_key" })).toBe("api_key");
		expect(getPlausibleSiteId({ PLAUSIBLE_SITE_ID: "example.com" })).toBe("example.com");
		expect(getPlausibleSiteId({})).toBe("sreetamdas.com");
	});

	test("returns a missing-config state without calling Plausible", async () => {
		const originalFetch = globalThis.fetch;
		let fetchCalled = false;
		globalThis.fetch = async () => {
			fetchCalled = true;
			return new Response("unexpected", { status: 500 });
		};

		try {
			const stats = await fetchPlausibleStats({ PLAUSIBLE_SITE_ID: "example.com" });

			expect(fetchCalled).toBe(false);
			expect(stats.status).toBe("missing-config");
			expect(stats.siteId).toBe("example.com");
			expect(stats.overview.visitors).toBe(0);
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("queries and maps Plausible v2 stats", async () => {
		const originalFetch = globalThis.fetch;
		const requestedBodies: Array<unknown> = [];
		globalThis.fetch = async (_input, init) => {
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
		};

		try {
			const stats = await fetchPlausibleStats(
				{
					PLAUSIBLE_API_KEY: "test_key",
					PLAUSIBLE_SITE_ID: "example.com",
				},
				"91d",
			);

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
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("returns an unavailable state when Plausible returns an error", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = async () => new Response("nope", { status: 401 });

		try {
			const stats = await fetchPlausibleStats({ PLAUSIBLE_API_KEY: "bad_key" });

			expect(stats.status).toBe("unavailable");
			expect(stats.topPages).toEqual([]);
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});

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
