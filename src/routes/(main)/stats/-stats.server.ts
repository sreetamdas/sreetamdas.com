import { createServerFn } from "@tanstack/react-start";

import { ANALYTICS_DATE_RANGES, type AnalyticsDateRange } from "@/lib/domains/Analytics/shared";

export type StatsSearch = {
	period: AnalyticsDateRange;
};

export const getStats = createServerFn({ method: "GET" })
	.validator((data): StatsSearch => {
		if (typeof data !== "object" || data === null || !("period" in data)) {
			return { period: "30d" satisfies AnalyticsDateRange };
		}

		return { period: parseDateRange(data.period) };
	})
	.handler(async ({ data }) => {
		const { fetchAnalyticsStats } = await import("@/lib/domains/Analytics/stats");
		return fetchAnalyticsStats(data.period);
	});

export function parseDateRange(value: unknown): AnalyticsDateRange {
	return typeof value === "string" && isAnalyticsDateRange(value) ? value : "30d";
}

function isAnalyticsDateRange(value: string): value is AnalyticsDateRange {
	return ANALYTICS_DATE_RANGES.some((range) => range === value);
}
