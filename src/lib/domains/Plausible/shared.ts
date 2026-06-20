export const DEFAULT_PLAUSIBLE_SITE_ID = "sreetamdas.com";

export type PlausibleDateRange = "7d" | "30d" | "91d" | "12mo" | "all";

export const PLAUSIBLE_DATE_RANGES: Array<PlausibleDateRange> = ["7d", "30d", "91d", "12mo", "all"];

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

export function createEmptyStats(
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
