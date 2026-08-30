import { env } from "cloudflare:workers";

import {
	createEmptyStats,
	ANALYTICS_DATE_RANGES,
	DEFAULT_ANALYTICS_SITE_ID,
	type AnalyticsDateRange,
	type AnalyticsStats,
} from "./shared";

type StatsRpc = { getStats: (slug: string, period: string) => Promise<unknown> };

export async function fetchAnalyticsStats(
	period: AnalyticsDateRange = "30d",
): Promise<AnalyticsStats> {
	const siteId =
		"ANALYTICS_PROJECT_SLUG" in env && typeof env.ANALYTICS_PROJECT_SLUG === "string"
			? env.ANALYTICS_PROJECT_SLUG
			: DEFAULT_ANALYTICS_SITE_ID;
	try {
		if (!isStatsRpc(env.STATS_RPC)) return createEmptyStats("unavailable", siteId, period);
		const result: unknown = await env.STATS_RPC.getStats(siteId, period);
		if (!isAnalyticsStats(result)) return createEmptyStats("unavailable", siteId, period);
		if (result.status !== "ready") return createEmptyStats(result.status, siteId, period);
		return result;
	} catch {
		return createEmptyStats("unavailable", siteId, period);
	}
}

function isStatsRpc(value: unknown): value is StatsRpc {
	return (
		typeof value === "object" &&
		value !== null &&
		"getStats" in value &&
		typeof value.getStats === "function"
	);
}

function isAnalyticsStats(value: unknown): value is AnalyticsStats {
	if (!isRecord(value)) return false;
	if (value.status === "missing-config" || value.status === "unavailable") return true;
	if (value.status !== "ready" || !isRecord(value.overview)) return false;
	const overview = value.overview;
	return (
		typeof value.siteId === "string" &&
		typeof value.period === "string" &&
		ANALYTICS_DATE_RANGES.some((period) => period === value.period) &&
		typeof value.updatedAt === "string" &&
		Object.values(overview).every((item) => typeof item === "number") &&
		[
			"topPages",
			"entryPages",
			"exitPages",
			"topSources",
			"referrers",
			"channels",
			"countries",
			"cities",
			"devices",
			"browsers",
			"operatingSystems",
			"timeline",
		].every((key) => key in value && Array.isArray(value[key]))
	);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
