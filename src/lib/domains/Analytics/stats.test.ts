import { describe, expect, test, vi } from "vitest";

const cloudflare = vi.hoisted<{ env: Record<string, unknown> }>(() => ({ env: {} }));
vi.mock("cloudflare:workers", () => cloudflare);

import { fetchAnalyticsStats } from "./stats";

describe("native analytics stats", () => {
	test("maps a ready RPC response", async () => {
		cloudflare.env = {
			ANALYTICS_PROJECT_SLUG: "site",
			STATS_RPC: { getStats: vi.fn(() => Promise.resolve(readyStats())) },
		};
		await expect(fetchAnalyticsStats("7d")).resolves.toMatchObject({ status: "ready" });
	});

	test("maps RPC errors to the empty shape", async () => {
		cloudflare.env = {
			ANALYTICS_PROJECT_SLUG: "site",
			STATS_RPC: { getStats: vi.fn(() => Promise.reject(new Error("down"))) },
		};
		await expect(fetchAnalyticsStats()).resolves.toMatchObject({
			status: "unavailable",
			siteId: "site",
		});
	});
});

function readyStats() {
	return {
		status: "ready",
		siteId: "site",
		period: "7d",
		updatedAt: new Date().toISOString(),
		overview: {
			visitors: 1,
			visits: 1,
			pageviews: 1,
			viewsPerVisit: 1,
			bounceRate: 0,
			visitDuration: 1,
		},
		topPages: [],
		entryPages: [],
		exitPages: [],
		topSources: [],
		referrers: [],
		channels: [],
		countries: [],
		cities: [],
		devices: [],
		browsers: [],
		operatingSystems: [],
		timeline: [],
	};
}
