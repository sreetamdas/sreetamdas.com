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
	| "visit_duration";

const OVERVIEW_METRICS: Array<PlausibleQueryMetric> = [
	"visitors",
	"visits",
	"pageviews",
	"views_per_visit",
	"bounce_rate",
	"visit_duration",
];
const TOP_PAGE_METRICS: Array<PlausibleQueryMetric> = ["visitors", "pageviews"];
const SOURCE_METRICS: Array<PlausibleQueryMetric> = ["visitors"];
const TIMELINE_METRICS: Array<PlausibleQueryMetric> = ["visitors"];

type PlausibleDateRange = "7d" | "30d" | "12mo";

type PlausibleQueryBody = {
	site_id: string;
	date_range: PlausibleDateRange;
	metrics: Array<PlausibleQueryMetric>;
	dimensions?: Array<string>;
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
	topSources: Array<{
		source: string;
		visitors: number;
	}>;
	timeline: Array<{
		date: string;
		visitors: number;
	}>;
};

export function getPlausibleApiKey(env: object | undefined): string | undefined {
	return readServerEnvString(env, ["PLAUSIBLE_API_KEY", "PLAUSIBLE_STATS_API_KEY"]);
}

export function getPlausibleSiteId(env: object | undefined): string {
	return readServerEnvString(env, ["PLAUSIBLE_SITE_ID"]) ?? DEFAULT_PLAUSIBLE_SITE_ID;
}

export async function fetchPlausibleStats(env: object | undefined): Promise<PlausibleStats> {
	const apiKey = getPlausibleApiKey(env);
	const siteId = getPlausibleSiteId(env);
	const period: PlausibleDateRange = "30d";

	if (!apiKey) {
		return createEmptyStats("missing-config", siteId, period);
	}

	try {
		const [overview, topPages, topSources, timeline] = await Promise.all([
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
			queryPlausible(apiKey, {
				site_id: siteId,
				date_range: period,
				metrics: [...SOURCE_METRICS],
				dimensions: ["visit:source"],
				order_by: [["visitors", "desc"]],
				pagination: { limit: 6 },
			}),
			queryPlausible(apiKey, {
				site_id: siteId,
				date_range: period,
				metrics: [...TIMELINE_METRICS],
				dimensions: ["time:day"],
				order_by: [["time:day", "asc"]],
			}),
		]);

		return {
			status: "ready",
			siteId,
			period,
			updatedAt: new Date().toISOString(),
			overview: parseOverview(overview),
			topPages: parseTopPages(topPages),
			topSources: parseTopSources(topSources),
			timeline: parseTimeline(timeline),
		};
	} catch (_error: unknown) {
		return createEmptyStats("unavailable", siteId, period);
	}
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
		topSources: [],
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

function parseTopSources(response: PlausibleQueryResponse): PlausibleStats["topSources"] {
	return response.results.map((row) => {
		const source = row.dimensions[0];
		return {
			source: source && source.length > 0 ? source : "Direct / None",
			visitors: getMetric(row.metrics, 0),
		};
	});
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
