"use client";

/**
 * Local TanStack Start talk demo route.
 *
 * This is not meant to be a polished production showcase. During the talk, open
 * this file in the IDE and hover: `validateSearch`, `loaderDeps`, `deps`,
 * `serverSnapshot`, `Route.useSearch()`, `Route.useLoaderData()`, and
 * `navigate({ search })`. Good live edits: add a `DevLabTopic`, rename a search
 * field, or pass an invalid value to `chooseTopic` and let TypeScript complain.
 */
import { Await, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Suspense, type ReactNode } from "react";

import { SITE_TITLE_APPEND } from "@/config";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

import {
	DEV_LAB_AUDIENCES,
	DEV_LAB_TOPICS,
	getDevLabServerSnapshot,
	getDevLabSlowNote,
	parseDevLabSearch,
	type DevLabAudience,
	type DevLabTopic,
} from "./-dev-lab.server";

export const Route = createFileRoute("/slides/tanstack-start/dev-lab")({
	validateSearch: parseDevLabSearch,
	loaderDeps: ({ search }) => search,
	loader: async ({ deps }) => {
		const serverSnapshot = await getDevLabServerSnapshot({ data: deps });
		const slowNotePromise = getDevLabSlowNote(deps);
		return { serverSnapshot, slowNotePromise };
	},
	component: DevLabPage,
	head: () => {
		const title = `TanStack Start local dev lab ${SITE_TITLE_APPEND}`;
		const canonical = canonicalUrl("/slides/tanstack-start/dev-lab");
		const ogImage = defaultOgImageUrl();
		return {
			links: [{ rel: "canonical", href: canonical }],
			meta: [
				{ title },
				{
					name: "description",
					content: "A small local route for demonstrating TanStack Start type inference.",
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
	const routeSearch = Route.useSearch();
	const { serverSnapshot, slowNotePromise } = Route.useLoaderData();
	const navigate = useNavigate({ from: "/slides/tanstack-start/dev-lab" });

	function chooseTopic(topic: DevLabTopic) {
		void navigate({ search: { ...routeSearch, topic } });
	}

	function chooseAudience(audience: DevLabAudience) {
		void navigate({ search: { ...routeSearch, audience } });
	}

	const hoverTargets = [
		"routeSearch",
		"serverSnapshot",
		"slowNotePromise",
		"chooseTopic",
		"chooseAudience",
	];

	return (
		<main className="col-[1/-1] min-h-screen bg-background px-6 py-10 text-foreground">
			<div className="mx-auto grid max-w-4xl gap-6">
				<header className="rounded-global border border-foreground/15 bg-foreground/[0.03] p-6">
					<p className="font-mono text-sm text-primary">/slides/tanstack-start/dev-lab</p>
					<h1 className="mt-3 font-serif text-5xl font-bold text-balance">Local IDE hover demo</h1>
					<p className="mt-4 max-w-2xl text-lg text-foreground/70">
						The page is intentionally boring. The demo is this route file: hover the route pieces,
						make a tiny typed edit, save, and let Vite keep the browser state alive.
					</p>
				</header>

				<section className="grid gap-4 rounded-global border border-foreground/15 p-6">
					<h2 className="font-serif text-3xl font-bold">Typed URL state</h2>
					<div className="flex flex-wrap gap-2">
						{DEV_LAB_TOPICS.map((topic) => (
							<DemoButton
								key={topic}
								active={routeSearch.topic === topic}
								onClick={() => chooseTopic(topic)}
							>
								{topic}
							</DemoButton>
						))}
					</div>
					<div className="flex flex-wrap gap-2">
						{DEV_LAB_AUDIENCES.map((audience) => (
							<DemoButton
								key={audience}
								active={routeSearch.audience === audience}
								onClick={() => chooseAudience(audience)}
							>
								{audience}
							</DemoButton>
						))}
					</div>
				</section>

				<section className="grid gap-4 rounded-global border border-foreground/15 p-6">
					<h2 className="font-serif text-3xl font-bold">Loader + server function data</h2>
					<DemoValue label="topic" value={serverSnapshot.search.topic} />
					<DemoValue label="audience" value={serverSnapshot.search.audience} />
					<DemoValue label="claim" value={serverSnapshot.claim} />
					<DemoValue label="runtime" value={serverSnapshot.runtime} />
					<DemoValue label="request id" value={serverSnapshot.requestId} />
				</section>

				<section className="grid gap-4 rounded-global border border-foreground/15 p-6">
					<h2 className="font-serif text-3xl font-bold">Deferred data</h2>
					<Suspense fallback={<p className="font-mono text-foreground/60">loading slow note…</p>}>
						<Await promise={slowNotePromise}>
							{(slowNote) => (
								<div className="rounded-global bg-foreground/[0.04] p-4">
									<DemoValue label={slowNote.label} value={slowNote.message} />
									<DemoValue label="resolved" value={slowNote.resolvedAtIso} />
								</div>
							)}
						</Await>
					</Suspense>
				</section>

				<section className="grid gap-4 rounded-global border border-primary/25 bg-primary/5 p-6">
					<h2 className="font-serif text-3xl font-bold text-primary">IDE hover tour</h2>
					<ul className="grid gap-2 font-mono text-sm">
						{hoverTargets.map((target) => (
							<li key={target}>hover {target}</li>
						))}
					</ul>
				</section>
			</div>
		</main>
	);
}

function DemoButton({ active, onClick, children }: DemoButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={
				active
					? "rounded-full border border-primary bg-primary px-4 py-2 font-mono text-sm text-background dark:text-foreground"
					: "rounded-full border border-foreground/20 px-4 py-2 font-mono text-sm hover:border-primary"
			}
		>
			{children}
		</button>
	);
}

type DemoButtonProps = {
	active: boolean;
	onClick: () => void;
	children: ReactNode;
};

function DemoValue({ label, value }: { label: string; value: string }) {
	return (
		<div className="grid gap-1 border-b border-foreground/10 pb-2 last:border-b-0 sm:grid-cols-[8rem_1fr]">
			<span className="font-mono text-sm text-foreground/55">{label}</span>
			<span className="font-mono text-sm break-words">{value}</span>
		</div>
	);
}
