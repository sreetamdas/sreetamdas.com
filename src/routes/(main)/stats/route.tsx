import { Await, createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { StatsCounter } from "@/lib/domains/PageInteraction/StatsCounter";
import {
	createEmptyStats,
	DEFAULT_PLAUSIBLE_SITE_ID,
	type PlausibleDateRange,
	type PlausibleStats,
} from "@/lib/domains/Plausible/shared";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

import {
	DashboardControls,
	HeroFact,
	StatsContent,
	StatsSkeleton,
	dateRangeDescriptions,
} from "../-stats/components";
import { getStats, parseDateRange, type StatsSearch } from "./-stats.server";

export const Route = createFileRoute("/(main)/stats")({
	component: StatsPage,
	headers: () => ({
		"cache-control": "public, max-age=0, stale-while-revalidate=600",
	}),
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

function createUnavailableStats(period: PlausibleDateRange): PlausibleStats {
	return createEmptyStats("unavailable", DEFAULT_PLAUSIBLE_SITE_ID, period);
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
			<StatsCounter />
		</>
	);
}
