export const DEFAULT_ANALYTICS_SITE_ID = "sreetamdas-com-prod";

export type AnalyticsDateRange = "7d" | "30d" | "91d" | "12mo" | "all";
export const ANALYTICS_DATE_RANGES: Array<AnalyticsDateRange> = ["7d", "30d", "91d", "12mo", "all"];
export type AnalyticsStatsStatus = "ready" | "missing-config" | "unavailable";

export type StatsBreakdownRow = { name: string; visitors: number; percentage: number };
export type StatsCountryRow = StatsBreakdownRow & { code: string };
export type AnalyticsStats = {
	status: AnalyticsStatsStatus;
	siteId: string;
	period: AnalyticsDateRange;
	updatedAt: string;
	overview: {
		visitors: number;
		visits: number;
		pageviews: number;
		viewsPerVisit: number;
		bounceRate: number;
		visitDuration: number;
	};
	topPages: Array<{ path: string; visitors: number; pageviews: number }>;
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
	timeline: Array<{ date: string; visitors: number }>;
};

export function createEmptyStats(
	status: AnalyticsStatsStatus,
	siteId: string,
	period: AnalyticsDateRange,
): AnalyticsStats {
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
