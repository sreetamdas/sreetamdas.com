import { Await, createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Suspense } from "react";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import {
	createEmptyStats,
	fetchPlausibleStats,
	getPlausibleSiteId,
	PLAUSIBLE_DATE_RANGES,
	type PlausibleDateRange,
	type PlausibleStats,
} from "@/lib/domains/Plausible/stats";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

import {
	DashboardControls,
	HeroFact,
	StatsContent,
	StatsSkeleton,
	dateRangeDescriptions,
} from "./-stats/components";

type StatsSearch = {
	period: PlausibleDateRange;
};

export const Route = createFileRoute("/(main)/stats")({
	component: StatsPage,
	validateSearch: (search: Record<string, string>): StatsSearch => ({
		period: parseDateRange(search.period),
	}),
	loaderDeps: ({ search }) => ({ period: search.period }),
	loader: ({ deps }) => ({
		stats: getStats({ data: deps }).catch(() => createUnavailableStats(deps.period)),
	}),
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
	.validator((data): StatsSearch => {
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

function createUnavailableStats(period: PlausibleDateRange): PlausibleStats {
	return createEmptyStats("unavailable", getPlausibleSiteId(undefined), period);
}

function StatsPage() {
	const { stats } = Route.useLoaderData();
	const search = Route.useSearch();
	const activePeriod = search.period;
	return (
		<>
			<section className="py-14 sm:py-16">
				<p className="mb-5 font-mono text-sm text-primary">/stats</p>
				<h1 className="font-serif text-6xl leading-none font-bold tracking-tight text-balance md:text-8xl">
					Public analytics
				</h1>
				<p className="mt-6 max-w-[62ch] text-lg text-pretty text-foreground/80">
					A Plausible-powered readout for this site: public enough to inspect, private enough to
					avoid cookies and personal data.
				</p>
				<dl className="mt-8 flex flex-wrap gap-3">
					<HeroFact label="Window" value={dateRangeDescriptions[activePeriod]} />
					<HeroFact label="Provider" value="Plausible" />
					<HeroFact label="Tracking" value="No cookies" />
				</dl>
			</section>

			<DashboardControls activePeriod={activePeriod} />
			<Suspense fallback={<StatsSkeleton />}>
				<Await promise={stats}>{(resolvedStats) => <StatsContent stats={resolvedStats} />}</Await>
			</Suspense>
			<ViewsCounter />
		</>
	);
}
