"use client";

import { Await, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Suspense, type ReactNode } from "react";

import { SITE_TITLE_APPEND } from "@/config";
import { Code } from "@/lib/components/Typography";
import { cn } from "@/lib/helpers/utils";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

import {
	DEV_LAB_AUDIENCES,
	DEV_LAB_MODES,
	DEV_LAB_RUNTIMES,
	defaultDevLabSearch,
	getDevLabDeferredPanel,
	getDevLabSnapshot,
	parseDevLabSearch,
	type DevLabSearch,
} from "./-dev-lab.server";

export const Route = createFileRoute("/slides/tanstack-start/dev-lab")({
	validateSearch: parseDevLabSearch,
	loaderDeps: ({ search }) => search,
	loader: async ({ deps }) => {
		const snapshot = await getDevLabSnapshot({ data: deps });
		return {
			snapshot,
			deferredPanel: getDevLabDeferredPanel({ data: deps }),
		};
	},
	component: DevLabPage,
	head: () => {
		const title = `TanStack Start dev lab ${SITE_TITLE_APPEND}`;
		const canonical = canonicalUrl("/slides/tanstack-start/dev-lab");
		const ogImage = defaultOgImageUrl();
		return {
			links: [{ rel: "canonical", href: canonical }],
			meta: [
				{ title },
				{
					name: "description",
					content:
						"A tiny TanStack Start route for demonstrating typed URL state, loaders, " +
						"server functions, deferred data, and Vite HMR during the talk.",
				},
				{ property: "og:title", content: title },
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: canonical },
				{ property: "og:image", content: ogImage },
				{ name: "twitter:title", content: title },
				{ name: "twitter:image", content: ogImage },
			],
		};
	},
	staleTime: 1000 * 30,
});

function DevLabPage() {
	const { snapshot, deferredPanel } = Route.useLoaderData();
	const search = Route.useSearch();
	const safeSearch = search ?? defaultDevLabSearch();
	const navigate = useNavigate({ from: "/slides/tanstack-start/dev-lab" });
	function updateSearch(nextSearch: DevLabSearch) {
		void navigate({ search: nextSearch });
	}

	return (
		<main className="col-[1/-1] min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
			<div className="mx-auto grid max-w-6xl gap-8">
				<header className="rounded-global border border-foreground/15 bg-foreground/[0.03] p-6 sm:p-8">
					<p className="font-mono text-sm text-primary">/slides/tanstack-start/dev-lab</p>
					<div className="mt-4 grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-end">
						<div>
							<h1 className="font-serif text-5xl leading-none font-bold tracking-tight text-balance sm:text-7xl">
								TanStack Start dev lab
							</h1>
							<p className="mt-5 max-w-3xl text-lg text-foreground/75 sm:text-xl">
								A tiny route you can switch to during the talk: meaningful data, typed URL state,
								loader deps, a server function, deferred data, and a Vite/TypeScript edit path.
							</p>
						</div>
						<aside className="rounded-global border border-primary/25 bg-primary/10 p-4">
							<p className="font-mono text-xs text-primary uppercase">current proof</p>
							<p className="mt-2 font-serif text-3xl font-bold text-primary">
								{snapshot.active.shortLabel}
							</p>
							<p className="mt-2 text-sm text-foreground/70">{snapshot.active.claim}</p>
						</aside>
					</div>
				</header>

				<section className="grid gap-4 lg:grid-cols-[1fr_18rem]">
					<div className="rounded-global border border-foreground/15 bg-background p-4">
						<p className="font-mono text-sm text-foreground/55">progressive proof</p>
						<nav
							className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
							role="group"
							aria-label="Dev lab mode"
						>
							{DEV_LAB_MODES.map((mode) => (
								<button
									key={mode.mode}
									type="button"
									onClick={() => updateSearch({ ...safeSearch, mode: mode.mode })}
									className={cn(
										"rounded-global border p-4 text-left transition-colors",
										mode.mode === safeSearch.mode
											? "border-primary bg-primary text-background dark:text-foreground"
											: "border-foreground/15 bg-foreground/[0.03] hover:border-primary/60",
									)}
								>
									<span className="font-mono text-xs opacity-70">{mode.label}</span>
									<span className="mt-2 block font-serif text-2xl font-bold">
										{mode.shortLabel}
									</span>
								</button>
							))}
						</nav>
					</div>

					<ControlPanel search={safeSearch} onSearchChange={updateSearch} />
				</section>

				<section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
					<article className="rounded-global border border-primary/25 bg-primary/5 p-6">
						<p className="font-mono text-sm text-primary uppercase">{snapshot.active.label}</p>
						<h2 className="mt-2 font-serif text-4xl font-bold text-primary">
							{snapshot.active.claim}
						</h2>
						<p className="mt-4 text-lg text-foreground/75">{snapshot.active.whatChanges}</p>
						<div className="mt-6 rounded-global border border-foreground/15 bg-background p-4">
							<p className="font-mono text-xs text-foreground/55 uppercase">live edit to show</p>
							<p className="mt-2 text-lg">{snapshot.active.liveEdit}</p>
							<p className="mt-3 font-mono text-sm text-primary">{snapshot.active.codePointer}</p>
						</div>
					</article>

					<article className="rounded-global border border-foreground/15 bg-foreground/[0.03] p-6">
						<p className="font-mono text-sm text-foreground/55 uppercase">server snapshot</p>
						<dl className="mt-4 grid gap-3">
							<FactRow label="request" value={snapshot.requestId} />
							<FactRow label="rendered" value={snapshot.renderedAtIso} />
							<FactRow label="audience" value={snapshot.audienceLabel} />
							<FactRow label="runtime" value={snapshot.runtimeLabel} />
						</dl>
						<p className="mt-5 text-foreground/75">{snapshot.serverFact}</p>
					</article>
				</section>

				<section className="grid gap-6 lg:grid-cols-2">
					<article className="rounded-global border border-foreground/15 bg-background p-6">
						<h2 className="font-serif text-3xl font-bold">What this shows progressively</h2>
						<ol className="mt-5 grid gap-3 p-0">
							{snapshot.progressiveProof.map((row) => (
								<li
									key={row.label}
									className="grid gap-2 rounded-global bg-foreground/[0.04] p-4 sm:grid-cols-[10rem_1fr]"
								>
									<span className="font-mono text-sm text-primary">{row.label}</span>
									<span>{row.value}</span>
								</li>
							))}
						</ol>
					</article>

					<article className="rounded-global border border-foreground/15 bg-background p-6">
						<h2 className="font-serif text-3xl font-bold">Deferred panel</h2>
						<p className="mt-2 text-foreground/70">
							The loader already rendered the page shell. This panel is the un-awaited promise,
							deliberately slowed so you can point at the skeleton.
						</p>
						<Suspense fallback={<DeferredSkeleton />}>
							<Await promise={deferredPanel}>
								{(panel) => (
									<div className="mt-5 rounded-global border border-primary/20 bg-primary/5 p-4">
										<p className="font-mono text-sm text-primary">
											resolved after {panel.delayMs}ms · {panel.generatedAtIso}
										</p>
										<dl className="mt-4 grid gap-3">
											{panel.rows.map((row) => (
												<FactRow key={row.label} label={row.label} value={row.value} />
											))}
										</dl>
									</div>
								)}
							</Await>
						</Suspense>
					</article>
				</section>

				<section className="rounded-global border border-foreground/15 bg-foreground/[0.03] p-6">
					<h2 className="font-serif text-3xl font-bold">Stage script for the local cutaway</h2>
					<div className="mt-4 grid gap-4 lg:grid-cols-3">
						<ScriptCard
							title="1. Start with URL state"
							body={
								"Click the pills and show the URL/search object changing without " +
								"any ad-hoc parser in the component."
							}
						/>
						<ScriptCard
							title="2. Make a typed edit"
							body={
								"Change a mode or field name in the union/server input and let " +
								"TypeScript point to the affected route contract."
							}
						/>
						<ScriptCard
							title="3. Save and keep flow"
							body={
								"Save the file, keep the page open, and use Vite HMR as the " +
								"payoff: the app model did not reset your demo."
							}
						/>
					</div>
					<p className="mt-5 text-sm text-foreground/60">
						Suggested live URL: <Code>/slides/tanstack-start/dev-lab?mode=router</Code>
					</p>
				</section>
			</div>
		</main>
	);
}

function ControlPanel({
	search,
	onSearchChange,
}: {
	search: DevLabSearch;
	onSearchChange: (search: DevLabSearch) => void;
}) {
	return (
		<aside className="rounded-global border border-foreground/15 bg-foreground/[0.03] p-4">
			<p className="font-mono text-sm text-foreground/55">typed controls</p>
			<div className="mt-4 grid gap-4">
				<OptionGroup title="Audience">
					{DEV_LAB_AUDIENCES.map((audience) => (
						<SmallButton
							key={audience.value}
							onClick={() => onSearchChange({ ...search, audience: audience.value })}
							active={search.audience === audience.value}
						>
							{audience.label}
						</SmallButton>
					))}
				</OptionGroup>
				<OptionGroup title="Runtime">
					{DEV_LAB_RUNTIMES.map((runtime) => (
						<SmallButton
							key={runtime.value}
							onClick={() => onSearchChange({ ...search, runtime: runtime.value })}
							active={search.runtime === runtime.value}
						>
							{runtime.label}
						</SmallButton>
					))}
				</OptionGroup>
			</div>
		</aside>
	);
}

function OptionGroup({ title, children }: { title: string; children: ReactNode }) {
	return (
		<div>
			<p className="font-mono text-xs text-foreground/50 uppercase">{title}</p>
			<div className="mt-2 flex flex-wrap gap-2">{children}</div>
		</div>
	);
}

function SmallButton({
	onClick,
	active,
	children,
}: {
	onClick: () => void;
	active: boolean;
	children: ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"rounded-full border px-3 py-1.5 font-mono text-xs transition-colors",
				active
					? "border-primary bg-primary text-background dark:text-foreground"
					: "border-foreground/15 hover:border-primary/60",
			)}
		>
			{children}
		</button>
	);
}

function FactRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="grid gap-1 border-b border-foreground/10 pb-2 last:border-b-0 last:pb-0 sm:grid-cols-[8rem_minmax(0,1fr)]">
			<dt className="font-mono text-sm text-foreground/55">{label}</dt>
			<dd className="min-w-0 font-mono text-sm break-all">{value}</dd>
		</div>
	);
}

function DeferredSkeleton() {
	return (
		<div className="mt-5 animate-pulse rounded-global border border-foreground/10 bg-foreground/[0.03] p-4">
			<div className="h-4 w-56 rounded-full bg-foreground/15" />
			<div className="mt-4 grid gap-3">
				{[0, 1, 2, 3].map((row) => (
					<div key={row} className="h-5 rounded-full bg-foreground/10" />
				))}
			</div>
		</div>
	);
}

function ScriptCard({ title, body }: { title: string; body: string }) {
	return (
		<article className="rounded-global border border-foreground/15 bg-background p-4">
			<h3 className="font-serif text-2xl font-bold">{title}</h3>
			<p className="mt-2 text-foreground/70">{body}</p>
		</article>
	);
}
