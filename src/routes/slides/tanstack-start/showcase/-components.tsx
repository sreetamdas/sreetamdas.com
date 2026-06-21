"use client";

import { Link } from "@tanstack/react-router";
import { Hydrate, useServerFn } from "@tanstack/react-start";
import { visible } from "@tanstack/react-start/hydration";
import { type ReactNode, useEffect, useState } from "react";

import { Code, Gradient } from "@/lib/components/Typography";
import { cn } from "@/lib/helpers/utils";

import { getRuntimeSide } from "./-environment";
import { type ShowcaseSection } from "./-shared";
import { getShowcaseSnapshot } from "./-showcase.server";

type ShowcaseSnapshot = Awaited<ReturnType<typeof getShowcaseSnapshot>>;

type FeatureCard = {
	id: ShowcaseSection;
	label: string;
	nextPain: string;
	startMove: string;
	repoProof: Array<string>;
};

const routerFeatureCard: FeatureCard = {
	id: "router",
	label: "Typed router state",
	nextPain: "Search params usually arrive as loose strings that every page has to parse again.",
	startMove:
		"The route validates URL state once, then loaders, links, and components share the type.",
	repoProof: [
		"/stats validates period and feeds loaderDeps",
		"/slides/tanstack-start stores slide, step, live, master, and presenter in the URL",
		"Header links use typed TanStack Router links with intent preloading",
	],
};

const featureCards: Array<FeatureCard> = [
	routerFeatureCard,
	{
		id: "server",
		label: "Typed server boundary",
		nextPain:
			"Server Actions are convenient, but the boundary still needs manual validation and middleware shape.",
		startMove:
			"Server functions are explicit RPC: GET or POST, validator first, middleware context typed into the handler.",
		repoProof: [
			"getStats is a GET server function used from a loader",
			"likes/views use GET and POST server functions from client hooks",
			"this page uses client + server function middleware to pass typed context",
		],
	},
	{
		id: "rendering",
		label: "Rendering control",
		nextPain: "Rendering behavior is often a framework default you work around route by route.",
		startMove:
			"Start keeps SSR, RSC, static server functions, selective SSR, and deferred hydration as explicit route-level choices.",
		repoProof: [
			"blog MDX is rendered with renderServerComponent",
			"/rwc, newsletter, and keebs use staticFunctionMiddleware",
			"this route keeps full SSR while deferring hydration for a below-fold island",
		],
	},
	{
		id: "deployment",
		label: "Deployment portability",
		nextPain: "The happy path is frequently optimized around one hosting platform.",
		startMove:
			"The same route model deploys to Workers with D1, KV, Durable Objects, Sentry, and Vite plugins.",
		repoProof: [
			"wrangler.jsonc binds D1, KV, SITE_PRESENCE, and SLIDE_SESSIONS",
			"slide live sessions route to a Durable Object server route",
			"vite.config.ts wires Cloudflare, RSC, prerendering, sitemap, and import protection",
		],
	},
];

type ShowcasePageProps = {
	activeFeature: ShowcaseSection;
	initialSnapshot: ShowcaseSnapshot;
};

export function ShowcasePage({ activeFeature, initialSnapshot }: ShowcasePageProps) {
	const activeCard = featureCards.find((card) => card.id === activeFeature) ?? routerFeatureCard;

	return (
		<div className="mx-auto grid max-w-6xl px-4 pb-20 sm:px-6">
			<section className="py-14 sm:py-16">
				<p className="mb-5 font-mono text-sm text-primary">/slides/tanstack-start/showcase</p>
				<h1 className="font-serif text-6xl leading-none font-bold tracking-tight text-balance md:text-8xl">
					<Gradient>Start over convention</Gradient>
				</h1>
				<p className="mt-6 max-w-[68ch] text-lg text-pretty text-foreground/80">
					A conference companion for showing how this site uses TanStack Start: typed URLs, explicit
					server boundaries, opt-in rendering choices, and Cloudflare-native deployment.
				</p>
			</section>

			<FeatureNav activeFeature={activeFeature} />

			<section className="grid gap-6 py-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
				<FeatureStory card={activeCard} />
				<FunctionMiddlewareDemo feature={activeFeature} initialSnapshot={initialSnapshot} />
			</section>

			<section className="grid gap-6 py-10 lg:grid-cols-3">
				<ExampleCard
					title="Typed links + URL state"
					description="Hover these links in an editor: the destination and search object are checked against the route tree."
					code={`<Link to="/stats" search={{ period: "30d" }} />\n<Link to="/slides/tanstack-start" search={{ live: "demo" }} />`}
				>
					<div className="flex flex-wrap gap-3 pt-2">
						<LinkButton to="/stats" label="Open /stats" />
						<LinkButton to="/slides/tanstack-start" label="Open deck" />
					</div>
				</ExampleCard>

				<ExampleCard
					title="RSC as data"
					description="The blog loader fetches a server-rendered MDX subtree and composes client islands through it."
					code={`const Renderable = await renderServerComponent(\n\t<MDXContent components={{ Sparkles }} />\n);\nreturn { post, Renderable };`}
				/>

				<RuntimeCard />
			</section>

			<section className="py-12">
				<div className="mb-4 max-w-[58ch]">
					<h2 className="font-serif text-4xl font-bold text-primary">Deferred hydration</h2>
					<p className="mt-3 text-foreground/75">
						This island is server-rendered into the document, but Start can delay loading and
						hydrating its JavaScript until the boundary is close to the viewport.
					</p>
				</div>
				<Hydrate when={visible({ rootMargin: "320px" })}>
					<DeferredHydrationIsland />
				</Hydrate>
			</section>
		</div>
	);
}

function FeatureNav({ activeFeature }: { activeFeature: ShowcaseSection }) {
	return (
		<nav aria-label="TanStack Start feature demos" className="flex flex-wrap gap-3">
			{featureCards.map((card) => (
				<Link
					key={card.id}
					to="/slides/tanstack-start/showcase"
					search={{ feature: card.id }}
					className={cn(
						"rounded-full border px-4 py-2 text-sm transition-colors",
						card.id === activeFeature
							? "border-primary bg-primary text-background"
							: "border-foreground/20 hover:border-primary hover:text-primary",
					)}
				>
					{card.label}
				</Link>
			))}
		</nav>
	);
}

function FeatureStory({ card }: { card: FeatureCard }) {
	return (
		<article className="rounded-global border border-foreground/10 bg-foreground/[0.03] p-6">
			<p className="font-mono text-sm text-primary">feature / {card.id}</p>
			<h2 className="mt-3 font-serif text-4xl font-bold">{card.label}</h2>
			<div className="mt-6 grid gap-4 md:grid-cols-2">
				<ComparisonBlock label="Next.js pressure" text={card.nextPain} />
				<ComparisonBlock label="Start move" text={card.startMove} />
			</div>
			<div className="mt-6">
				<h3 className="font-mono text-sm text-foreground/60 uppercase">Repo proof</h3>
				<ul className="mt-3 grid gap-2">
					{card.repoProof.map((item) => (
						<li key={item} className="rounded-global bg-background/60 px-3 py-2 text-sm">
							{item}
						</li>
					))}
				</ul>
			</div>
		</article>
	);
}

function ComparisonBlock({ label, text }: { label: string; text: string }) {
	return (
		<div className="rounded-global bg-background/70 p-4">
			<p className="font-mono text-xs text-foreground/55 uppercase">{label}</p>
			<p className="mt-2 text-sm leading-6 text-foreground/80">{text}</p>
		</div>
	);
}

function FunctionMiddlewareDemo({
	feature,
	initialSnapshot,
}: {
	feature: ShowcaseSection;
	initialSnapshot: ShowcaseSnapshot;
}) {
	const getSnapshot = useServerFn(getShowcaseSnapshot);
	const [snapshot, setSnapshot] = useState(initialSnapshot);
	const [isRefreshing, setIsRefreshing] = useState(false);

	async function refreshSnapshot() {
		setIsRefreshing(true);
		try {
			const nextSnapshot = await getSnapshot({ data: { feature } });
			setSnapshot(nextSnapshot);
		} finally {
			setIsRefreshing(false);
		}
	}

	return (
		<aside className="rounded-global border border-primary/30 bg-primary/5 p-6">
			<p className="font-mono text-sm text-primary">live server function middleware</p>
			<h2 className="mt-3 font-serif text-3xl font-bold">Client → middleware → server</h2>
			<dl className="mt-6 grid gap-3 text-sm">
				<SnapshotRow label="feature" value={snapshot.activeFeature} />
				<SnapshotRow label="client context" value={snapshot.clientRuntime} />
				<SnapshotRow label="server context" value={snapshot.serverRuntime} />
				<SnapshotRow label="request id" value={snapshot.requestId} />
				<SnapshotRow label="server-only fn" value={snapshot.boundaryLabel} />
			</dl>
			<button
				type="button"
				onClick={() => void refreshSnapshot()}
				className="mt-6 rounded-full bg-primary px-4 py-2 text-sm text-background transition-opacity hover:opacity-80 disabled:opacity-50"
				disabled={isRefreshing}
			>
				{isRefreshing ? "Refreshing..." : "Call server function again"}
			</button>
		</aside>
	);
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-3 border-b border-foreground/10 pb-2 last:border-b-0 last:pb-0">
			<dt className="font-mono text-foreground/55">{label}</dt>
			<dd className="min-w-0 font-mono break-all">{value}</dd>
		</div>
	);
}

function ExampleCard({
	title,
	description,
	code,
	children,
}: {
	title: string;
	description: string;
	code: string;
	children?: ReactNode;
}) {
	return (
		<article className="rounded-global border border-foreground/10 p-5">
			<h2 className="font-serif text-2xl font-bold text-primary">{title}</h2>
			<p className="mt-3 text-sm leading-6 text-foreground/75">{description}</p>
			<pre className="mt-4 overflow-x-auto rounded-global bg-foreground/10 p-4 text-xs">
				<code>{code}</code>
			</pre>
			{children}
		</article>
	);
}

function LinkButton({ to, label }: { label: string; to: "/slides/tanstack-start" | "/stats" }) {
	return (
		<Link to={to} preload="intent" className="link-base text-primary hover:text-secondary">
			{label}
		</Link>
	);
}

function RuntimeCard() {
	const [runtime, setRuntime] = useState("waiting for hydration");

	useEffect(() => {
		setRuntime(getRuntimeSide() ?? "unknown runtime");
	}, []);

	return (
		<ExampleCard
			title="Environment functions"
			description="One function has separate server and client implementations; each side is tree-shaken from the other bundle."
			code={`createIsomorphicFn()\n\t.server(() => "server render")\n\t.client(() => "hydrated browser")`}
		>
			<p className="pt-4 text-sm">
				Current runtime: <Code>{runtime}</Code>
			</p>
		</ExampleCard>
	);
}

function DeferredHydrationIsland() {
	const [count, setCount] = useState(0);

	return (
		<div className="rounded-global border border-secondary/40 bg-secondary/10 p-6">
			<p className="font-mono text-sm text-secondary">hydration waits for visibility</p>
			<h3 className="mt-3 font-serif text-3xl font-bold">Visible HTML, delayed JavaScript</h3>
			<p className="mt-3 max-w-[62ch] text-sm leading-6 text-foreground/75">
				This is useful for comments, charts, embeds, and other below-fold UI: keep the page
				indexable and good-looking, but do not make the browser hydrate everything up front.
			</p>
			<button
				type="button"
				onClick={() => setCount((value) => value + 1)}
				className="mt-5 rounded-full bg-secondary px-4 py-2 text-sm text-background transition-opacity hover:opacity-80"
			>
				Hydrated clicks: {count}
			</button>
		</div>
	);
}
