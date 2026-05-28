import type { ReactNode } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { LinkTo } from "@/lib/components/Anchor";
import { Code, Gradient } from "@/lib/components/Typography";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { fetchPlausibleStats, type PlausibleStats } from "@/lib/domains/Plausible/stats";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

export const Route = createFileRoute("/(main)/stats")({
	component: StatsPage,
	loader: () => getStats(),
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

const getStats = createServerFn({ method: "GET" }).handler(async ({ context }) => {
	return fetchPlausibleStats(context.env);
});

function StatsPage() {
	const stats = Route.useLoaderData();
	return (
		<>
			<section className="py-16 text-center">
				<p className="text-foreground/60 mb-4 font-mono text-sm tracking-[0.4em] uppercase">
					/stats
				</p>
				<h1 className="mx-auto max-w-4xl font-serif text-6xl leading-none font-bold md:text-8xl">
					<Gradient>Public analytics</Gradient>
				</h1>
				<p className="text-foreground/75 mx-auto mt-6 max-w-2xl text-lg">
					A tiny Plausible-powered peek at how this site has been doing over the last 30 days. No
					cookies, no personal data, no creepy stuff.
				</p>
			</section>

			<StatsStatus stats={stats} />
			<Overview stats={stats} />
			<div className="grid gap-6 py-8 lg:grid-cols-[1.1fr_0.9fr]">
				<TopPages stats={stats} />
				<TopSources stats={stats} />
			</div>
			<Timeline stats={stats} />
			<ViewsCounter />
		</>
	);
}

function StatsStatus({ stats }: { stats: PlausibleStats }) {
	if (stats.status === "ready") {
		return (
			<p className="rounded-global border-primary/25 bg-primary/10 text-foreground/75 border border-solid px-4 py-3 text-sm">
				Showing <Code>{stats.siteId}</Code> for the last <Code>{stats.period}</Code>. Updated{" "}
				<time dateTime={stats.updatedAt}>{formatDateTime(stats.updatedAt)}</time>.
			</p>
		);
	}

	const message =
		stats.status === "missing-config"
			? "Plausible credentials are not configured for this environment yet."
			: "Plausible is not reachable right now.";

	return (
		<p className="rounded-global border-secondary/25 bg-secondary/10 text-foreground/75 border border-solid px-4 py-3 text-sm">
			{message} The page is wired up and will render live data once the API is available.
		</p>
	);
}

function Overview({ stats }: { stats: PlausibleStats }) {
	return (
		<section className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3" aria-label="Overview">
			<MetricCard label="Visitors" value={formatNumber(stats.overview.visitors)} />
			<MetricCard label="Visits" value={formatNumber(stats.overview.visits)} />
			<MetricCard label="Pageviews" value={formatNumber(stats.overview.pageviews)} />
			<MetricCard label="Views / visit" value={formatDecimal(stats.overview.viewsPerVisit)} />
			<MetricCard label="Bounce rate" value={`${formatDecimal(stats.overview.bounceRate)}%`} />
			<MetricCard label="Avg visit" value={formatDuration(stats.overview.visitDuration)} />
		</section>
	);
}

function MetricCard({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-global border-foreground/15 bg-foreground/5 dark:bg-foreground/10 border border-solid p-5 transition-colors">
			<p className="text-foreground/55 m-0 font-mono text-xs tracking-[0.25em] uppercase">
				{label}
			</p>
			<p className="m-0 mt-3 font-serif text-4xl font-bold">{value}</p>
		</div>
	);
}

function TopPages({ stats }: { stats: PlausibleStats }) {
	return (
		<StatsPanel title="Top pages" emptyMessage="No page data yet.">
			{stats.topPages.map((page) => (
				<li className="grid grid-cols-[1fr_auto] gap-4 py-3" key={page.path}>
					<LinkTo href={page.path} className="truncate font-mono text-sm">
						{page.path}
					</LinkTo>
					<span className="text-foreground/70 text-sm">
						{formatNumber(page.visitors)} visitors · {formatNumber(page.pageviews)} views
					</span>
				</li>
			))}
		</StatsPanel>
	);
}

function TopSources({ stats }: { stats: PlausibleStats }) {
	return (
		<StatsPanel title="Top sources" emptyMessage="No source data yet.">
			{stats.topSources.map((source) => (
				<li className="grid grid-cols-[1fr_auto] gap-4 py-3" key={source.source}>
					<span className="truncate font-mono text-sm">{source.source}</span>
					<span className="text-foreground/70 text-sm">
						{formatNumber(source.visitors)} visitors
					</span>
				</li>
			))}
		</StatsPanel>
	);
}

function StatsPanel({
	title,
	emptyMessage,
	children,
}: {
	title: string;
	emptyMessage: string;
	children: Array<ReactNode>;
}) {
	return (
		<section className="rounded-global border-foreground/15 bg-background border border-solid p-5">
			<h2 className="m-0 font-serif text-3xl font-bold">{title}</h2>
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

	return (
		<section className="rounded-global border-foreground/15 bg-background border border-solid p-5">
			<h2 className="m-0 font-serif text-3xl font-bold">Daily visitors</h2>
			{stats.timeline.length > 0 ? (
				<ol className="mt-6 flex h-44 items-end gap-1 p-0" aria-label="Daily visitors chart">
					{stats.timeline.map((point) => (
						<li className="group relative flex min-w-1 flex-1 list-none items-end" key={point.date}>
							<div
								className="bg-primary/70 group-hover:bg-secondary rounded-t-global w-full transition-colors"
								style={{ height: `${Math.max(6, (point.visitors / maxVisitors) * 100)}%` }}
							/>
							<span className="sr-only">
								{point.date}: {formatNumber(point.visitors)} visitors
							</span>
						</li>
					))}
				</ol>
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
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}
