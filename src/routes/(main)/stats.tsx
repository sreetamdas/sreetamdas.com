import type { ReactNode } from "react";

import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { LinkTo } from "@/lib/components/Anchor";
import { StatsWorldMap } from "@/lib/components/StatsWorldMap.client";
import { Code } from "@/lib/components/Typography";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import {
	fetchPlausibleStats,
	PLAUSIBLE_DATE_RANGES,
	type PlausibleDateRange,
	type PlausibleStats,
	type StatsBreakdownRow,
	type StatsCountryRow,
} from "@/lib/domains/Plausible/stats";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

type StatsSearch = {
	period: PlausibleDateRange;
};

const dateRangeLabels: Record<PlausibleDateRange, string> = {
	"7d": "7D",
	"30d": "30D",
	"91d": "Quarter",
	"12mo": "Year",
	all: "All",
};

const dateRangeDescriptions: Record<PlausibleDateRange, string> = {
	"7d": "Last 7 days",
	"30d": "Last 30 days",
	"91d": "Last 91 days",
	"12mo": "Last 12 months",
	all: "All public history",
};

const dashboardLenses = [
	{ href: "#pages", label: "Pages" },
	{ href: "#acquisition", label: "Acquisition" },
	{ href: "#audience", label: "Audience" },
	{ href: "#technology", label: "Tech" },
];

export const Route = createFileRoute("/(main)/stats")({
	component: StatsPage,
	validateSearch: (search: Record<string, string>): StatsSearch => ({
		period: parseDateRange(search.period),
	}),
	loaderDeps: ({ search }) => ({ period: search.period }),
	loader: ({ deps }) => getStats({ data: deps }),
	head: () => {
		const title = `Stats ${SITE_TITLE_APPEND}`;
		const description = `Privacy-friendly public analytics for ${SITE_DESCRIPTION}`;
		const canonical = canonicalUrl("/stats");
		const ogImage = defaultOgImageUrl();

		return {
			links: [{ rel: "canonical", href: canonical }],
			meta: [
				{ title },
				{ name: "description", content: description },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: canonical },
				{ property: "og:image", content: ogImage },
				{ name: "twitter:title", content: title },
				{ name: "twitter:description", content: description },
				{ name: "twitter:image", content: ogImage },
			],
		};
	},
	staleTime: 1000 * 60 * 5,
});

const getStats = createServerFn({ method: "GET" })
	.inputValidator((data): StatsSearch => {
		if (typeof data !== "object" || data === null || !("period" in data)) {
			return { period: "30d" satisfies PlausibleDateRange };
		}

		return { period: parseDateRange(data.period) };
	})
	.handler(async ({ data, context }) => {
		return fetchPlausibleStats(context.env, data.period);
	});

function parseDateRange(value: unknown): PlausibleDateRange {
	return typeof value === "string" && isPlausibleDateRange(value) ? value : "30d";
}

function isPlausibleDateRange(value: string): value is PlausibleDateRange {
	return PLAUSIBLE_DATE_RANGES.some((range) => range === value);
}

function StatsPage() {
	const stats = Route.useLoaderData();
	const search = Route.useSearch();
	const activePeriod = search.period;
	return (
		<>
			<section className="py-14 sm:py-16">
				<p className="text-primary mb-5 font-mono text-sm">/stats</p>
				<h1 className="font-serif text-6xl leading-none font-bold tracking-[-0.025em] text-balance md:text-8xl">
					Public analytics
				</h1>
				<p className="text-foreground/80 mt-6 max-w-[62ch] text-lg text-pretty">
					A Plausible-powered readout for this site: public enough to inspect, private enough to
					avoid cookies and personal data.
				</p>
				<dl className="mt-8 flex flex-wrap gap-3">
					<HeroFact label="Window" value={dateRangeDescriptions[stats.period]} />
					<HeroFact label="Provider" value="Plausible" />
					<HeroFact label="Tracking" value="No cookies" />
				</dl>
			</section>

			<DashboardControls activePeriod={activePeriod} />
			<StatsStatus stats={stats} />
			<Overview stats={stats} />
			<Timeline stats={stats} />
			<PagesSection stats={stats} />
			<AcquisitionSection stats={stats} />
			<AudienceSection stats={stats} />
			<TechnologySection stats={stats} />
			<ViewsCounter />
		</>
	);
}

function DashboardControls({ activePeriod }: { activePeriod: PlausibleDateRange }) {
	return (
		<section className="rounded-global border-foreground/15 bg-foreground/5 dark:bg-foreground/10 col-[1/-1] mx-4 mb-6 max-w-5xl border border-solid p-3 sm:mx-auto sm:w-full">
			<div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
				<div>
					<p className="text-foreground/65 m-0 font-mono text-sm">Window</p>
					<nav className="mt-2 flex flex-wrap gap-2" aria-label="Stats time range">
						{PLAUSIBLE_DATE_RANGES.map((range) => (
							<LinkTo
								key={range}
								href={`/stats?period=${range}`}
								replaceClasses
								aria-current={activePeriod === range ? "page" : undefined}
								className={
									activePeriod === range
										? "rounded-global bg-primary text-background focus-visible:outline-secondary dark:text-foreground px-3 py-2 font-mono text-sm no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dashed"
										: "rounded-global text-foreground hover:bg-foreground/10 focus-visible:outline-secondary px-3 py-2 font-mono text-sm no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dashed"
								}
							>
								{dateRangeLabels[range]}
							</LinkTo>
						))}
					</nav>
				</div>
				<nav className="flex flex-wrap gap-2 sm:justify-end" aria-label="Stats sections">
					{dashboardLenses.map((lens) => (
						<LinkTo
							key={lens.href}
							href={lens.href}
							replaceClasses
							className="rounded-global text-foreground/80 hover:text-primary focus-visible:outline-secondary px-2 py-2 font-mono text-sm no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dashed"
						>
							{lens.label}
						</LinkTo>
					))}
				</nav>
			</div>
		</section>
	);
}

function HeroFact({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-global bg-foreground/5 dark:bg-foreground/10 px-3 py-2">
			<dt className="sr-only">{label}</dt>
			<dd className="m-0 font-mono text-sm">{value}</dd>
		</div>
	);
}

function StatsStatus({ stats }: { stats: PlausibleStats }) {
	if (stats.status === "ready") {
		return (
			<p className="rounded-global border-primary/25 bg-primary/10 text-foreground/80 col-[1/-1] mx-4 max-w-5xl border border-solid px-4 py-3 text-sm sm:mx-auto sm:w-full">
				Showing <Code>{stats.siteId}</Code> for <Code>{stats.period}</Code>. Updated{" "}
				<time dateTime={stats.updatedAt}>{formatDateTime(stats.updatedAt)}</time>.
			</p>
		);
	}

	const message =
		stats.status === "missing-config"
			? "Plausible credentials are not configured for this environment yet."
			: "Plausible is not reachable right now.";

	return (
		<p className="rounded-global border-secondary/25 bg-secondary/10 text-foreground/80 col-[1/-1] mx-4 max-w-5xl border border-solid px-4 py-3 text-sm sm:mx-auto sm:w-full">
			{message} The page is wired up and will render live data once the API is available.
		</p>
	);
}

const overviewMetrics: Array<{
	label: string;
	value: (stats: PlausibleStats) => string;
	tone?: "primary";
}> = [
	{ label: "Visitors", value: (stats) => formatNumber(stats.overview.visitors), tone: "primary" },
	{ label: "Visits", value: (stats) => formatNumber(stats.overview.visits) },
	{ label: "Pageviews", value: (stats) => formatNumber(stats.overview.pageviews) },
	{ label: "Views / visit", value: (stats) => formatDecimal(stats.overview.viewsPerVisit) },
	{ label: "Bounce rate", value: (stats) => `${formatDecimal(stats.overview.bounceRate)}%` },
	{ label: "Avg visit", value: (stats) => formatDuration(stats.overview.visitDuration) },
];

function Overview({ stats }: { stats: PlausibleStats }) {
	return (
		<section
			className="col-[1/-1] mx-4 grid max-w-5xl gap-4 py-8 sm:mx-auto sm:w-full sm:grid-cols-2 lg:grid-cols-3"
			aria-label="Overview"
		>
			{overviewMetrics.map((metric) => (
				<MetricCard
					key={metric.label}
					label={metric.label}
					value={metric.value(stats)}
					tone={metric.tone}
				/>
			))}
		</section>
	);
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone?: "primary" }) {
	return (
		<div
			className={
				tone === "primary"
					? "rounded-global border-primary/25 bg-primary/10 border border-solid p-5 transition-colors sm:col-span-2 lg:col-span-1"
					: "rounded-global border-foreground/15 bg-foreground/5 dark:bg-foreground/10 border border-solid p-5 transition-colors"
			}
		>
			<p className="text-foreground/65 m-0 font-mono text-sm">{label}</p>
			<p className="m-0 mt-3 font-serif text-4xl leading-none font-bold tracking-[-0.02em]">
				{value}
			</p>
		</div>
	);
}

function TopPages({ stats }: { stats: PlausibleStats }) {
	return (
		<StatsPanel
			title="Top pages"
			emptyMessage="No page data yet."
			description="Where pageviews cluster."
		>
			{stats.topPages.map((page) => (
				<li
					className="grid min-w-0 gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4"
					key={page.path}
				>
					<LinkTo href={page.path} className="min-w-0 truncate font-mono text-sm">
						{page.path}
					</LinkTo>
					<span className="text-foreground/75 text-sm sm:text-right">
						{formatNumber(page.visitors)} visitors · {formatNumber(page.pageviews)} views
					</span>
				</li>
			))}
		</StatsPanel>
	);
}

function PagesSection({ stats }: { stats: PlausibleStats }) {
	return (
		<DashboardSection
			id="pages"
			title="Pages"
			description="The paths people enter, read, and leave from. No goals or custom properties here."
		>
			<TopPages stats={stats} />
			<BreakdownPanel
				title="Entry pages"
				rows={stats.entryPages}
				emptyMessage="No entry page data yet."
			/>
			<BreakdownPanel
				title="Exit pages"
				rows={stats.exitPages}
				emptyMessage="No exit page data yet."
			/>
		</DashboardSection>
	);
}

function AcquisitionSection({ stats }: { stats: PlausibleStats }) {
	return (
		<DashboardSection
			id="acquisition"
			title="Acquisition"
			description="How people find the site, grouped by source, referrer, and channel."
		>
			<BreakdownPanel title="Sources" rows={stats.topSources} emptyMessage="No source data yet." />
			<BreakdownPanel
				title="Referrers"
				rows={stats.referrers}
				emptyMessage="No referrer data yet."
			/>
			<BreakdownPanel title="Channels" rows={stats.channels} emptyMessage="No channel data yet." />
		</DashboardSection>
	);
}

function AudienceSection({ stats }: { stats: PlausibleStats }) {
	return (
		<DashboardSection
			id="audience"
			title="Audience"
			description="Location data rendered as ranked geography, not a heavy map dependency."
		>
			<GeoPanel countries={stats.countries} />
			<BreakdownPanel title="Cities" rows={stats.cities} emptyMessage="No city data yet." />
		</DashboardSection>
	);
}

function TechnologySection({ stats }: { stats: PlausibleStats }) {
	return (
		<DashboardSection
			id="technology"
			title="Tech"
			description="Device, browser, and operating system breakdowns from visit-level Plausible dimensions."
		>
			<BreakdownPanel title="Devices" rows={stats.devices} emptyMessage="No device data yet." />
			<BreakdownPanel title="Browsers" rows={stats.browsers} emptyMessage="No browser data yet." />
			<BreakdownPanel
				title="Operating systems"
				rows={stats.operatingSystems}
				emptyMessage="No OS data yet."
			/>
		</DashboardSection>
	);
}

function DashboardSection({
	id,
	title,
	description,
	children,
}: {
	id: string;
	title: string;
	description: string;
	children: ReactNode;
}) {
	return (
		<section id={id} className="col-[1/-1] mx-4 max-w-5xl scroll-mt-24 py-7 sm:mx-auto sm:w-full">
			<div className="mb-5">
				<h2 className="m-0 font-serif text-4xl leading-tight font-bold tracking-[-0.02em]">
					{title}
				</h2>
				<p className="text-foreground/75 m-0 mt-2 max-w-[58ch] text-pretty">{description}</p>
			</div>
			<div className="grid gap-4 lg:grid-cols-3">{children}</div>
		</section>
	);
}

function BreakdownPanel({
	title,
	rows,
	emptyMessage,
}: {
	title: string;
	rows: Array<StatsBreakdownRow>;
	emptyMessage: string;
}) {
	return (
		<StatsPanel title={title} emptyMessage={emptyMessage}>
			{rows.map((row) => (
				<BreakdownRow key={row.name} row={row} />
			))}
		</StatsPanel>
	);
}

function BreakdownRow({ row }: { row: StatsBreakdownRow }) {
	return (
		<li className="grid gap-2 py-3">
			<div className="grid min-w-0 gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">
				<span className="min-w-0 truncate font-mono text-sm">{row.name}</span>
				<span className="text-foreground/75 text-sm sm:text-right">
					{formatNumber(row.visitors)} visitors · {formatPercentage(row.percentage)}
				</span>
			</div>
			<div className="bg-foreground/10 h-1.5 overflow-hidden rounded-full">
				<div
					className="bg-primary h-full rounded-full"
					style={{ width: barWidth(row.percentage) }}
				/>
			</div>
		</li>
	);
}

function GeoPanel({ countries }: { countries: Array<StatsCountryRow> }) {
	const topCountries = countries.slice(0, 5);
	return (
		<section className="rounded-global border-foreground/15 bg-background border border-solid p-5 lg:col-span-2">
			<div className="grid gap-1 sm:grid-cols-[1fr_auto] sm:items-start">
				<div>
					<h3 className="m-0 font-serif text-3xl font-bold">Countries</h3>
					<p className="text-foreground/70 m-0 mt-1 text-sm">
						A compact atlas of where visits originate.
					</p>
				</div>
				<p className="text-primary m-0 font-mono text-sm">{topCountries.length} shown</p>
			</div>
			{countries.length > 0 ? (
				<>
					<div className="rounded-global bg-foreground/5 dark:bg-foreground/10 mt-4 overflow-hidden p-2">
						<ClientOnly fallback={<WorldMapFallback />}>
							<StatsWorldMap countries={countries} />
						</ClientOnly>
					</div>
					<ol className="mt-4 grid gap-2 p-0">
						{topCountries.map((country, index) => (
							<li
								key={`${country.code}-${country.name}`}
								className="rounded-global bg-foreground/5 dark:bg-foreground/10 grid gap-2 p-3"
							>
								<div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
									<span className="text-foreground/55 font-mono text-xs">
										{String(index + 1).padStart(2, "0")}
									</span>
									<div className="min-w-0">
										<p className="m-0 truncate font-mono text-sm">{country.name}</p>
										<p className="text-foreground/60 m-0 font-mono text-xs">{country.code}</p>
									</div>
									<p className="m-0 text-right font-serif text-2xl leading-none font-bold">
										{formatPercentage(country.percentage)}
									</p>
								</div>
								<div className="bg-foreground/10 h-2 overflow-hidden rounded-full">
									<div
										className="bg-secondary h-full rounded-full"
										style={{ width: barWidth(country.percentage) }}
									/>
								</div>
							</li>
						))}
					</ol>
				</>
			) : (
				<p className="text-foreground/60 mt-4 text-sm">No country data yet.</p>
			)}
		</section>
	);
}

function WorldMapFallback() {
	return <div className="rounded-global bg-foreground/10 h-40 w-full animate-pulse" />;
}

function StatsPanel({
	title,
	emptyMessage,
	description,
	children,
}: {
	title: string;
	emptyMessage: string;
	description?: string;
	children: Array<ReactNode>;
}) {
	return (
		<section className="rounded-global border-foreground/15 bg-background border border-solid p-5">
			<h3 className="m-0 font-serif text-3xl font-bold">{title}</h3>
			{description ? <p className="text-foreground/70 m-0 mt-1 text-sm">{description}</p> : null}
			{children.length > 0 ? (
				<ol className="divide-foreground/10 m-0 mt-4 divide-y p-0">{children}</ol>
			) : (
				<p className="text-foreground/60 mt-4 text-sm">{emptyMessage}</p>
			)}
		</section>
	);
}

function Timeline({ stats }: { stats: PlausibleStats }) {
	const maxVisitors = Math.max(...stats.timeline.map((point) => point.visitors), 1);
	const firstDay = stats.timeline.at(0)?.date;
	const lastDay = stats.timeline.at(-1)?.date;

	return (
		<section className="rounded-global border-foreground/15 bg-background col-[1/-1] mx-4 max-w-5xl border border-solid p-5 sm:mx-auto sm:w-full">
			<div className="grid gap-1 sm:grid-cols-[1fr_auto] sm:items-end">
				<h2 className="m-0 font-serif text-3xl font-bold">Daily visitors</h2>
				{stats.timeline.length > 0 ? (
					<p className="text-foreground/70 m-0 text-sm sm:text-right">
						Peak day: {formatNumber(maxVisitors)} visitors
					</p>
				) : null}
			</div>
			{stats.timeline.length > 0 ? (
				<>
					<ol className="mt-6 flex h-44 items-end gap-1 p-0" aria-label="Daily visitors chart">
						{stats.timeline.map((point) => (
							<li
								className="group relative flex h-full min-w-1 flex-1 list-none items-end"
								key={point.date}
							>
								<div
									className="bg-primary/70 group-hover:bg-secondary rounded-t-global w-full transition-colors"
									style={{ height: `${Math.max(6, (point.visitors / maxVisitors) * 100)}%` }}
								/>
								<span className="bg-foreground text-background rounded-global pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 px-2 py-1 font-mono text-xs text-nowrap group-hover:block">
									{formatShortDate(point.date)} · {formatNumber(point.visitors)}
								</span>
								<span className="sr-only">
									{point.date}: {formatNumber(point.visitors)} visitors
								</span>
							</li>
						))}
					</ol>
					{firstDay && lastDay ? (
						<div className="text-foreground/65 mt-3 flex justify-between gap-4 font-mono text-xs">
							<time dateTime={firstDay}>{formatShortDate(firstDay)}</time>
							<time dateTime={lastDay}>{formatShortDate(lastDay)}</time>
						</div>
					) : null}
				</>
			) : (
				<p className="text-foreground/60 mt-4 text-sm">No daily visitor data yet.</p>
			)}
		</section>
	);
}

function formatNumber(value: number) {
	return new Intl.NumberFormat("en-US").format(value);
}

function formatDecimal(value: number) {
	return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

function formatPercentage(value: number) {
	return `${formatDecimal(value)}%`;
}

function barWidth(value: number) {
	return `${Math.min(100, Math.max(3, value))}%`;
}

function formatDuration(seconds: number) {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.round(seconds % 60);
	if (minutes === 0) {
		return `${remainingSeconds}s`;
	}
	return `${minutes}m ${remainingSeconds}s`;
}

function formatDateTime(value: string) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
		timeZone: "UTC",
		timeZoneName: "short",
	}).format(new Date(value));
}

function formatShortDate(value: string) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
	}).format(new Date(value));
}
