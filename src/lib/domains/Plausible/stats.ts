/**
 * Server-only Plausible Stats API integration for the public /stats page. It
 * keeps the API key in runtime env, validates the small subset of v2 query
 * responses this site renders, and returns a safe unavailable state when
 * analytics credentials are missing or Plausible is unreachable.
 */
import { readServerEnvString } from "@/lib/helpers/utils";

const PLAUSIBLE_QUERY_URL = "https://plausible.io/api/v2/query";
const DEFAULT_PLAUSIBLE_SITE_ID = "sreetamdas.com";

type PlausibleQueryMetric =
	| "visitors"
	| "visits"
	| "pageviews"
	| "views_per_visit"
	| "bounce_rate"
	| "visit_duration"
	| "percentage";

type PlausibleQueryFilter = ["is_not", string, Array<string>];

const OVERVIEW_METRICS: Array<PlausibleQueryMetric> = [
	"visitors",
	"visits",
	"pageviews",
	"views_per_visit",
	"bounce_rate",
	"visit_duration",
];
const TOP_PAGE_METRICS: Array<PlausibleQueryMetric> = ["visitors", "pageviews"];
const BREAKDOWN_METRICS: Array<PlausibleQueryMetric> = ["visitors", "percentage"];
const TIMELINE_METRICS: Array<PlausibleQueryMetric> = ["visitors"];

export type PlausibleDateRange = "7d" | "30d" | "91d" | "12mo" | "all";

export const PLAUSIBLE_DATE_RANGES: Array<PlausibleDateRange> = ["7d", "30d", "91d", "12mo", "all"];

type PlausibleQueryBody = {
	site_id: string;
	date_range: PlausibleDateRange;
	metrics: Array<PlausibleQueryMetric>;
	dimensions?: Array<string>;
	filters?: Array<PlausibleQueryFilter>;
	order_by?: Array<[string, "asc" | "desc"]>;
	pagination?: {
		limit: number;
	};
};

type PlausibleQueryRow = {
	dimensions: Array<string>;
	metrics: Array<number>;
};

type PlausibleQueryResponse = {
	results: Array<PlausibleQueryRow>;
};

export type PlausibleStatsStatus = "ready" | "missing-config" | "unavailable";

export type PlausibleStats = {
	status: PlausibleStatsStatus;
	siteId: string;
	period: PlausibleDateRange;
	updatedAt: string;
	overview: {
		visitors: number;
		visits: number;
		pageviews: number;
		viewsPerVisit: number;
		bounceRate: number;
		visitDuration: number;
	};
	topPages: Array<{
		path: string;
		visitors: number;
		pageviews: number;
	}>;
	entryPages: Array<StatsBreakdownRow>;
	exitPages: Array<StatsBreakdownRow>;
	topSources: Array<StatsBreakdownRow>;
	referrers: Array<StatsBreakdownRow>;
	channels: Array<StatsBreakdownRow>;
	countries: Array<StatsCountryRow>;
	cities: Array<StatsBreakdownRow>;
	devices: Array<StatsBreakdownRow>;
	browsers: Array<StatsBreakdownRow>;
	operatingSystems: Array<StatsBreakdownRow>;
	timeline: Array<{
		date: string;
		visitors: number;
	}>;
};

export type StatsBreakdownRow = {
	name: string;
	visitors: number;
	percentage: number;
};

export type StatsCountryRow = StatsBreakdownRow & {
	code: string;
};

export function getPlausibleApiKey(env: object | undefined): string | undefined {
	return readServerEnvString(env, ["PLAUSIBLE_API_KEY", "PLAUSIBLE_STATS_API_KEY"]);
}

export function getPlausibleSiteId(env: object | undefined): string {
	return readServerEnvString(env, ["PLAUSIBLE_SITE_ID"]) ?? DEFAULT_PLAUSIBLE_SITE_ID;
}

export async function fetchPlausibleStats(
	env: object | undefined,
	dateRange: PlausibleDateRange = "30d",
): Promise<PlausibleStats> {
	const apiKey = getPlausibleApiKey(env);
	const siteId = getPlausibleSiteId(env);
	const period = normalizePlausibleDateRange(dateRange);

	if (!apiKey) {
		return createEmptyStats("missing-config", siteId, period);
	}

	try {
		const [
			overview,
			topPages,
			entryPages,
			exitPages,
			topSources,
			referrers,
			channels,
			countries,
			cities,
			devices,
			browsers,
			operatingSystems,
			timeline,
		] = await Promise.all([
			queryPlausible(apiKey, {
				site_id: siteId,
				date_range: period,
				metrics: [...OVERVIEW_METRICS],
			}),
			queryPlausible(apiKey, {
				site_id: siteId,
				date_range: period,
				metrics: [...TOP_PAGE_METRICS],
				dimensions: ["event:page"],
				order_by: [["visitors", "desc"]],
				pagination: { limit: 8 },
			}),
			queryBreakdown(apiKey, siteId, period, "visit:entry_page", 6),
			queryBreakdown(apiKey, siteId, period, "visit:exit_page", 6),
			queryPlausible(apiKey, {
				site_id: siteId,
				date_range: period,
				metrics: [...BREAKDOWN_METRICS],
				dimensions: ["visit:source"],
				order_by: [["visitors", "desc"]],
				pagination: { limit: 8 },
			}),
			queryBreakdown(apiKey, siteId, period, "visit:referrer", 8),
			queryBreakdown(apiKey, siteId, period, "visit:channel", 6),
			queryPlausible(apiKey, {
				site_id: siteId,
				date_range: period,
				metrics: [...BREAKDOWN_METRICS],
				dimensions: ["visit:country_name", "visit:country"],
				filters: [["is_not", "visit:country_name", [""]]],
				order_by: [["visitors", "desc"]],
				pagination: { limit: 8 },
			}),
			queryBreakdown(apiKey, siteId, period, "visit:city_name", 8, [
				["is_not", "visit:city_name", [""]],
			]),
			queryBreakdown(apiKey, siteId, period, "visit:device", 6),
			queryBreakdown(apiKey, siteId, period, "visit:browser", 6),
			queryBreakdown(apiKey, siteId, period, "visit:os", 6),
			queryPlausible(apiKey, {
				site_id: siteId,
				date_range: period,
				metrics: [...TIMELINE_METRICS],
				dimensions: ["time"],
				order_by: [["time", "asc"]],
			}),
		]);

		return {
			status: "ready",
			siteId,
			period,
			updatedAt: new Date().toISOString(),
			overview: parseOverview(overview),
			topPages: parseTopPages(topPages),
			entryPages: parseBreakdown(entryPages, "Unknown entry"),
			exitPages: parseBreakdown(exitPages, "Unknown exit"),
			topSources: parseBreakdown(topSources, "Direct / None"),
			referrers: parseBreakdown(referrers, "Direct / None"),
			channels: parseBreakdown(channels, "Unattributed"),
			countries: parseCountries(countries),
			cities: parseBreakdown(cities, "Unknown city"),
			devices: parseBreakdown(devices, "Unknown device"),
			browsers: parseBreakdown(browsers, "Unknown browser"),
			operatingSystems: parseBreakdown(operatingSystems, "Unknown OS"),
			timeline: parseTimeline(timeline),
		};
	} catch (_error: unknown) {
		return createEmptyStats("unavailable", siteId, period);
	}
}

function normalizePlausibleDateRange(value: PlausibleDateRange): PlausibleDateRange {
	return PLAUSIBLE_DATE_RANGES.includes(value) ? value : "30d";
}

function queryBreakdown(
	apiKey: string,
	siteId: string,
	period: PlausibleDateRange,
	dimension: string,
	limit: number,
	filters?: PlausibleQueryBody["filters"],
) {
	return queryPlausible(apiKey, {
		site_id: siteId,
		date_range: period,
		metrics: [...BREAKDOWN_METRICS],
		dimensions: [dimension],
		filters,
		order_by: [["visitors", "desc"]],
		pagination: { limit },
	});
}

async function queryPlausible(
	apiKey: string,
	body: PlausibleQueryBody,
): Promise<PlausibleQueryResponse> {
	const response = await fetch(PLAUSIBLE_QUERY_URL, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		throw new Error(`Plausible query failed: ${response.status}`);
	}

	const payload: unknown = await response.json();
	if (!isPlausibleQueryResponse(payload)) {
		throw new Error("Plausible query returned an unexpected shape");
	}

	return payload;
}

function createEmptyStats(
	status: PlausibleStatsStatus,
	siteId: string,
	period: PlausibleDateRange,
): PlausibleStats {
	return {
		status,
		siteId,
		period,
		updatedAt: new Date().toISOString(),
		overview: {
			visitors: 0,
			visits: 0,
			pageviews: 0,
			viewsPerVisit: 0,
			bounceRate: 0,
			visitDuration: 0,
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

function parseOverview(response: PlausibleQueryResponse): PlausibleStats["overview"] {
	const metrics = response.results[0]?.metrics ?? [];
	return {
		visitors: getMetric(metrics, 0),
		visits: getMetric(metrics, 1),
		pageviews: getMetric(metrics, 2),
		viewsPerVisit: getMetric(metrics, 3),
		bounceRate: getMetric(metrics, 4),
		visitDuration: getMetric(metrics, 5),
	};
}

function parseTopPages(response: PlausibleQueryResponse): PlausibleStats["topPages"] {
	return response.results.map((row) => ({
		path: row.dimensions[0] ?? "Unknown page",
		visitors: getMetric(row.metrics, 0),
		pageviews: getMetric(row.metrics, 1),
	}));
}

function parseBreakdown(
	response: PlausibleQueryResponse,
	fallbackName: string,
): Array<StatsBreakdownRow> {
	return response.results.map((row) => ({
		name: normalizeDimension(row.dimensions[0], fallbackName),
		visitors: getMetric(row.metrics, 0),
		percentage: getMetric(row.metrics, 1),
	}));
}

function parseCountries(response: PlausibleQueryResponse): Array<StatsCountryRow> {
	return response.results.map((row) => ({
		name: normalizeDimension(row.dimensions[0], "Unknown country"),
		code: normalizeDimension(row.dimensions[1], "--"),
		visitors: getMetric(row.metrics, 0),
		percentage: getMetric(row.metrics, 1),
	}));
}

function normalizeDimension(value: string | undefined, fallback: string) {
	return value && value.length > 0 ? value : fallback;
}

function parseTimeline(response: PlausibleQueryResponse): PlausibleStats["timeline"] {
	return response.results.map((row) => ({
		date: row.dimensions[0] ?? "",
		visitors: getMetric(row.metrics, 0),
	}));
}

function getMetric(metrics: Array<number>, index: number): number {
	const metric = metrics[index];
	return Number.isFinite(metric) ? metric : 0;
}

function isPlausibleQueryResponse(value: unknown): value is PlausibleQueryResponse {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	if (!("results" in value) || !Array.isArray(value.results)) {
		return false;
	}

	return value.results.every(isPlausibleQueryRow);
}

function isPlausibleQueryRow(value: unknown): value is PlausibleQueryRow {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	if (!("dimensions" in value) || !("metrics" in value)) {
		return false;
	}

	return (
		Array.isArray(value.dimensions) &&
		value.dimensions.every((dimension) => typeof dimension === "string") &&
		Array.isArray(value.metrics) &&
		value.metrics.every((metric) => typeof metric === "number" && Number.isFinite(metric))
	);
}
