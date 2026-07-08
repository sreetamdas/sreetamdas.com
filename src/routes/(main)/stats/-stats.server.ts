import { createServerFn } from "@tanstack/react-start";

import { PLAUSIBLE_DATE_RANGES, type PlausibleDateRange } from "@/lib/domains/Plausible/shared";

export type StatsSearch = {
	period: PlausibleDateRange;
};

export const getStats = createServerFn({ method: "GET" })
	.validator((data): StatsSearch => {
		if (typeof data !== "object" || data === null || !("period" in data)) {
			return { period: "30d" satisfies PlausibleDateRange };
		}

		return { period: parseDateRange(data.period) };
	})
	.handler(async ({ data }) => {
		const { readPlausibleStatsCached } = await import("@/lib/domains/Plausible/stats");
		return readPlausibleStatsCached(data.period);
	});

export function parseDateRange(value: unknown): PlausibleDateRange {
	return typeof value === "string" && isPlausibleDateRange(value) ? value : "30d";
}

function isPlausibleDateRange(value: string): value is PlausibleDateRange {
	return PLAUSIBLE_DATE_RANGES.some((range) => range === value);
}
