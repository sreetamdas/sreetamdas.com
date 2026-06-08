import { ClientOnly } from "@tanstack/react-router";
import { type ReactNode } from "react";

import { LinkTo } from "@/lib/components/Anchor";
import { StatsWorldMap } from "@/lib/components/StatsWorldMap.client";
import { Code } from "@/lib/components/Typography";
import {
	PLAUSIBLE_DATE_RANGES,
	type PlausibleDateRange,
	type PlausibleStats,
	type StatsBreakdownRow,
	type StatsCountryRow,
} from "@/lib/domains/Plausible/stats";

const dateRangeLabels: Record<PlausibleDateRange, string> = {
	"7d": "7D",
	"30d": "30D",
	"91d": "Quarter",
	"12mo": "Year",
	all: "All",
};

export const dateRangeDescriptions: Record<PlausibleDateRange, string> = {
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

const DASHBOARD_SECTIONS = [
	{
		id: "pages",
		title: "Pages",
		description:
			"The paths people enter, read, and leave from. No goals or custom properties here.",
		panelTitles: ["Top pages", "Entry pages", "Exit pages"],
	},
	{
		id: "acquisition",
		title: "Acquisition",
		description: "How people find the site, grouped by source, referrer, and channel.",
		panelTitles: ["Sources", "Referrers", "Channels"],
	},
	{
		id: "audience",
		title: "Audience",
		description: "Location data rendered as ranked geography, not a heavy map dependency.",
		panelTitles: ["Countries", "Cities"],
		featured: true,
	},
	{
		id: "technology",
		title: "Tech",
		description:
			"Device, browser, and operating system breakdowns from visit-level Plausible dimensions.",
		panelTitles: ["Devices", "Browsers", "Operating systems"],
	},
] as const;

const [pagesSection, acquisitionSection, audienceSection, technologySection] = DASHBOARD_SECTIONS;

const numberFormatter = new Intl.NumberFormat("en-US");
const decimalFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric",
	hour: "numeric",
	minute: "2-digit",
	timeZone: "UTC",
	timeZoneName: "short",
});
const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
});

export function StatsContent({ stats }: { stats: PlausibleStats }) {
	return (
		<>
			<StatsStatus stats={stats} />
			<Overview stats={stats} />
			<Timeline stats={stats} />
			<PagesSection stats={stats} />
			<AcquisitionSection stats={stats} />
			<AudienceSection stats={stats} />
			<TechnologySection stats={stats} />
		</>
	);
}

export function StatsSkeleton() {
	return (
		<>
			<StatsStatusSkeleton />
			<OverviewSkeleton />
			<TimelineSkeleton />
			{DASHBOARD_SECTIONS.map((section) => (
				<DashboardSectionSkeleton key={section.id} {...section} />
			))}
		</>
	);
}

function StatsStatusSkeleton() {
	return (
		<p className="col-[1/-1] mx-4 max-w-5xl rounded-global border border-solid border-foreground/15 bg-foreground/5 px-4 py-3 text-sm sm:mx-auto sm:w-full dark:bg-foreground/10">
			<span className="block h-5 w-full max-w-md animate-pulse rounded-full bg-foreground/15" />
			<span className="sr-only">Loading analytics status</span>
		</p>
	);
}

function OverviewSkeleton() {
	return (
		<section
			className="col-[1/-1] mx-4 grid max-w-5xl gap-4 py-8 sm:mx-auto sm:w-full sm:grid-cols-2 lg:grid-cols-3"
			aria-label="Loading overview"
		>
			{overviewMetrics.map((metric) => (
				<MetricCardSkeleton key={metric.label} tone={metric.tone} />
			))}
		</section>
	);
}

function MetricCardSkeleton({ tone }: { tone?: "primary" }) {
	return (
		<div
			className={
				tone === "primary"
					? "rounded-global border border-solid border-primary/25 bg-primary/10 p-5 transition-colors sm:col-span-2 lg:col-span-1"
					: "rounded-global border border-solid border-foreground/15 bg-foreground/5 p-5 transition-colors dark:bg-foreground/10"
			}
		>
			<span className="block h-4 w-24 animate-pulse rounded-full bg-foreground/15" />
			<span className="mt-3 block h-10 w-32 animate-pulse rounded-full bg-foreground/15" />
		</div>
	);
}

function TimelineSkeleton() {
	return (
		<section className="col-[1/-1] mx-4 max-w-5xl rounded-global border border-solid border-foreground/15 bg-background p-5 sm:mx-auto sm:w-full">
			<div className="grid gap-1 sm:grid-cols-[1fr_auto] sm:items-end">
				<h2 className="m-0 font-serif text-3xl font-bold">Daily visitors</h2>
				<span className="h-5 w-32 animate-pulse rounded-full bg-foreground/15 sm:justify-self-end" />
			</div>
			<ol className="mt-6 flex h-44 items-end gap-1 p-0" aria-label="Loading daily visitors chart">
				{[42, 56, 38, 72, 64, 88, 52, 60, 46, 78, 68, 54].map((height, index) => (
					<li className="flex h-full min-w-1 flex-1 list-none items-end" key={`${height}-${index}`}>
						<span
							className="w-full animate-pulse rounded-t-global bg-foreground/15"
							style={{ height: `${height}%` }}
						/>
					</li>
				))}
			</ol>
			<div className="mt-3 flex justify-between gap-4 font-mono text-xs text-foreground/65">
				<span className="h-4 w-16 animate-pulse rounded-full bg-foreground/15" />
				<span className="h-4 w-16 animate-pulse rounded-full bg-foreground/15" />
			</div>
		</section>
	);
}

function DashboardSectionSkeleton({
	id,
	title,
	description,
	panelTitles,
	featured,
}: {
	id: string;
	title: string;
	description: string;
	panelTitles: ReadonlyArray<string>;
	featured?: boolean;
}) {
	return (
		<DashboardSection id={id} title={title} description={description}>
			{panelTitles.map((panelTitle, index) =>
				featured && index === 0 ? (
					<FeaturedPanelSkeleton key={panelTitle} title={panelTitle} />
				) : (
					<StatsPanelSkeleton key={panelTitle} title={panelTitle} />
				),
			)}
		</DashboardSection>
	);
}

function FeaturedPanelSkeleton({ title }: { title: string }) {
	return (
		<section className="rounded-global border border-solid border-foreground/15 bg-background p-5 lg:col-span-2">
			<div className="grid gap-1 sm:grid-cols-[1fr_auto] sm:items-start">
				<div>
					<h3 className="m-0 font-serif text-3xl font-bold">{title}</h3>
					<span className="mt-2 block h-4 w-56 animate-pulse rounded-full bg-foreground/15" />
				</div>
				<span className="h-5 w-16 animate-pulse rounded-full bg-foreground/15 sm:justify-self-end" />
			</div>
			<div className="mt-4 rounded-global bg-foreground/5 p-2 dark:bg-foreground/10">
				<span className="block h-40 w-full animate-pulse rounded-global bg-foreground/15" />
			</div>
			<ol className="mt-4 grid gap-2 p-0">
				{[0, 1, 2].map((row) => (
					<li
						key={row}
						className="grid gap-2 rounded-global bg-foreground/5 p-3 dark:bg-foreground/10"
					>
						<span className="h-5 w-full animate-pulse rounded-full bg-foreground/15" />
						<span className="h-2 w-full animate-pulse rounded-full bg-foreground/15" />
					</li>
				))}
			</ol>
		</section>
	);
}

function StatsPanelSkeleton({ title }: { title: string }) {
	return (
		<section className="rounded-global border border-solid border-foreground/15 bg-background p-5">
			<h3 className="m-0 font-serif text-3xl font-bold">{title}</h3>
			<ol className="m-0 mt-4 divide-y divide-foreground/10 p-0">
				{[0, 1, 2].map((row) => (
					<li className="grid gap-2 py-3" key={row}>
						<span className="h-5 w-full animate-pulse rounded-full bg-foreground/15" />
						<span className="h-2 w-full animate-pulse rounded-full bg-foreground/15" />
					</li>
				))}
			</ol>
		</section>
	);
}

export function DashboardControls({ activePeriod }: { activePeriod: PlausibleDateRange }) {
	return (
		<section className="col-[1/-1] mx-4 mb-6 max-w-5xl rounded-global border border-solid border-foreground/15 bg-foreground/5 p-3 sm:mx-auto sm:w-full dark:bg-foreground/10">
			<div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
				<div>
					<p className="m-0 font-mono text-sm text-foreground/65">Window</p>
					<nav className="mt-2 flex flex-wrap gap-2" aria-label="Stats time range">
						{PLAUSIBLE_DATE_RANGES.map((range) => (
							<LinkTo
								key={range}
								href={`/stats?period=${range}`}
								replaceClasses
								aria-current={activePeriod === range ? "page" : undefined}
								className={
									activePeriod === range
										? "rounded-global bg-primary px-3 py-2 font-mono text-sm text-background no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary focus-visible:outline-dashed dark:text-foreground"
										: "rounded-global px-3 py-2 font-mono text-sm text-foreground no-underline transition-colors hover:bg-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary focus-visible:outline-dashed"
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
							className="rounded-global px-2 py-2 font-mono text-sm text-foreground/80 no-underline transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary focus-visible:outline-dashed"
						>
							{lens.label}
						</LinkTo>
					))}
				</nav>
			</div>
		</section>
	);
}

export function HeroFact({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-global bg-foreground/5 px-3 py-2 dark:bg-foreground/10">
			<dt className="sr-only">{label}</dt>
			<dd className="m-0 font-mono text-sm">{value}</dd>
		</div>
	);
}

function StatsStatus({ stats }: { stats: PlausibleStats }) {
	if (stats.status === "ready") {
		return (
			<p className="col-[1/-1] mx-4 max-w-5xl rounded-global border border-solid border-primary/25 bg-primary/10 px-4 py-3 text-sm text-foreground/80 sm:mx-auto sm:w-full">
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
		<p className="col-[1/-1] mx-4 max-w-5xl rounded-global border border-solid border-secondary/25 bg-secondary/10 px-4 py-3 text-sm text-foreground/80 sm:mx-auto sm:w-full">
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
					? "rounded-global border border-solid border-primary/25 bg-primary/10 p-5 transition-colors sm:col-span-2 lg:col-span-1"
					: "rounded-global border border-solid border-foreground/15 bg-foreground/5 p-5 transition-colors dark:bg-foreground/10"
			}
		>
			<p className="m-0 font-mono text-sm text-foreground/65">{label}</p>
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
					<span className="text-sm text-foreground/75 sm:text-right">
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
			id={pagesSection.id}
			title={pagesSection.title}
			description={pagesSection.description}
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
			id={acquisitionSection.id}
			title={acquisitionSection.title}
			description={acquisitionSection.description}
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
			id={audienceSection.id}
			title={audienceSection.title}
			description={audienceSection.description}
		>
			<GeoPanel countries={stats.countries} />
			<BreakdownPanel title="Cities" rows={stats.cities} emptyMessage="No city data yet." />
		</DashboardSection>
	);
}

function TechnologySection({ stats }: { stats: PlausibleStats }) {
	return (
		<DashboardSection
			id={technologySection.id}
			title={technologySection.title}
			description={technologySection.description}
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
				<p className="m-0 mt-2 max-w-[58ch] text-pretty text-foreground/75">{description}</p>
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
				<span className="text-sm text-foreground/75 sm:text-right">
					{formatNumber(row.visitors)} visitors · {formatPercentage(row.percentage)}
				</span>
			</div>
			<div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
				<div
					className="h-full rounded-full bg-primary"
					style={{ width: barWidth(row.percentage) }}
				/>
			</div>
		</li>
	);
}

function GeoPanel({ countries }: { countries: Array<StatsCountryRow> }) {
	const topCountries = countries.slice(0, 5);
	return (
		<section className="rounded-global border border-solid border-foreground/15 bg-background p-5 lg:col-span-2">
			<div className="grid gap-1 sm:grid-cols-[1fr_auto] sm:items-start">
				<div>
					<h3 className="m-0 font-serif text-3xl font-bold">Countries</h3>
					<p className="m-0 mt-1 text-sm text-foreground/70">
						A compact atlas of where visits originate.
					</p>
				</div>
				<p className="m-0 font-mono text-sm text-primary">{topCountries.length} shown</p>
			</div>
			{countries.length > 0 ? (
				<>
					<div className="mt-4 overflow-hidden rounded-global bg-foreground/5 p-2 dark:bg-foreground/10">
						<ClientOnly fallback={<WorldMapFallback />}>
							<StatsWorldMap countries={countries} />
						</ClientOnly>
					</div>
					<ol className="mt-4 grid gap-2 p-0">
						{topCountries.map((country, index) => (
							<li
								key={`${country.code}-${country.name}`}
								className="grid gap-2 rounded-global bg-foreground/5 p-3 dark:bg-foreground/10"
							>
								<div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
									<span className="font-mono text-xs text-foreground/55">
										{String(index + 1).padStart(2, "0")}
									</span>
									<div className="min-w-0">
										<p className="m-0 truncate font-mono text-sm">{country.name}</p>
										<p className="m-0 font-mono text-xs text-foreground/60">{country.code}</p>
									</div>
									<p className="m-0 text-right font-serif text-2xl leading-none font-bold">
										{formatPercentage(country.percentage)}
									</p>
								</div>
								<div className="h-2 overflow-hidden rounded-full bg-foreground/10">
									<div
										className="h-full rounded-full bg-secondary"
										style={{ width: barWidth(country.percentage) }}
									/>
								</div>
							</li>
						))}
					</ol>
				</>
			) : (
				<p className="mt-4 text-sm text-foreground/60">No country data yet.</p>
			)}
		</section>
	);
}

function WorldMapFallback() {
	return <div className="h-40 w-full animate-pulse rounded-global bg-foreground/10" />;
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
		<section className="rounded-global border border-solid border-foreground/15 bg-background p-5">
			<h3 className="m-0 font-serif text-3xl font-bold">{title}</h3>
			{description ? <p className="m-0 mt-1 text-sm text-foreground/70">{description}</p> : null}
			{children.length > 0 ? (
				<ol className="m-0 mt-4 divide-y divide-foreground/10 p-0">{children}</ol>
			) : (
				<p className="mt-4 text-sm text-foreground/60">{emptyMessage}</p>
			)}
		</section>
	);
}

function Timeline({ stats }: { stats: PlausibleStats }) {
	const maxVisitors = Math.max(...stats.timeline.map((point) => point.visitors), 1);
	const firstDay = stats.timeline.at(0)?.date;
	const lastDay = stats.timeline.at(-1)?.date;

	return (
		<section className="col-[1/-1] mx-4 max-w-5xl rounded-global border border-solid border-foreground/15 bg-background p-5 sm:mx-auto sm:w-full">
			<div className="grid gap-1 sm:grid-cols-[1fr_auto] sm:items-end">
				<h2 className="m-0 font-serif text-3xl font-bold">Daily visitors</h2>
				{stats.timeline.length > 0 ? (
					<p className="m-0 text-sm text-foreground/70 sm:text-right">
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
									className="w-full rounded-t-global bg-primary/70 transition-colors group-hover:bg-secondary"
									style={{ height: `${Math.max(6, (point.visitors / maxVisitors) * 100)}%` }}
								/>
								<span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-global bg-foreground px-2 py-1 font-mono text-xs text-nowrap text-background group-hover:block">
									{formatShortDate(point.date)} · {formatNumber(point.visitors)}
								</span>
								<span className="sr-only">
									{point.date}: {formatNumber(point.visitors)} visitors
								</span>
							</li>
						))}
					</ol>
					{firstDay && lastDay ? (
						<div className="mt-3 flex justify-between gap-4 font-mono text-xs text-foreground/65">
							<time dateTime={firstDay}>{formatShortDate(firstDay)}</time>
							<time dateTime={lastDay}>{formatShortDate(lastDay)}</time>
						</div>
					) : null}
				</>
			) : (
				<p className="mt-4 text-sm text-foreground/60">No daily visitor data yet.</p>
			)}
		</section>
	);
}

function formatNumber(value: number) {
	return numberFormatter.format(value);
}

function formatDecimal(value: number) {
	return decimalFormatter.format(value);
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
	return dateTimeFormatter.format(new Date(value));
}

function formatShortDate(value: string) {
	return shortDateFormatter.format(new Date(value));
}
