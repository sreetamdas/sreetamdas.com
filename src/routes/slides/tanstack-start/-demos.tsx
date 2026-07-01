"use client";

/**
 * Slide-embeddable demos for the TanStack Start deck.
 *
 * These run *inside* a slide, so the talk never leaves the deck. Everything here
 * is genuinely client-callable: server functions execute on the server no matter
 * who invokes them, so calling them from a button via `useServerFn` is real work,
 * not a mock.
 *
 * The one mechanic that cannot run inside a client-rendered slide is the
 * server-stream-into-SSR-shell `<Await>` (the deck has no per-slide loader to
 * defer). `StreamingDemo` reproduces the *visible* behavior — shell now, slow
 * data later — with a real server round-trip that carries a deliberate delay.
 */
import { useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CompositeComponent } from "@tanstack/react-start/rsc";
import { type ReactNode, useEffect, useState } from "react";

import { Code } from "@/lib/components/Typography";
import { cn } from "@/lib/helpers/utils";

import { type BoundarySnapshot, getBoundarySnapshot } from "./-boundary.server";
import { getCompositeCard } from "./-composite.server";
import { getRscPanel } from "./-rsc.server";
import { getStreamingData, STREAMING_DEMO_DELAY_MS, type StreamingData } from "./-streaming.server";

function DemoShell({
	kicker,
	title,
	children,
	className,
}: {
	kicker: string;
	title: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<section
			className={cn(
				"my-4 rounded-global border border-primary/30 bg-primary/5 p-6 font-serif",
				className,
			)}
		>
			<p className="font-mono text-base text-primary">{kicker}</p>
			<h3 className="mt-1 font-serif text-3xl font-bold text-primary">{title}</h3>
			<div className="mt-5">{children}</div>
		</section>
	);
}

function DemoRow({ label, value }: { label: string; value: ReactNode }) {
	return (
		<div className="grid grid-cols-[12rem_minmax(0,1fr)] gap-4 border-b border-foreground/10 pb-2 last:border-b-0 last:pb-0">
			<dt className="font-mono text-lg text-foreground/55">{label}</dt>
			<dd className="min-w-0 font-mono text-lg break-all">{value}</dd>
		</div>
	);
}

function DemoButton({
	onClick,
	disabled,
	children,
}: {
	onClick: () => void;
	disabled?: boolean;
	children: ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className="mt-6 rounded-full bg-primary px-5 py-2.5 font-sans text-xl text-background transition-opacity hover:opacity-80 disabled:opacity-50"
		>
			{children}
		</button>
	);
}

/**
 * Typed URL state — read live from the deck's own route. The deck *is* the demo:
 * its slide/step/live/presenter are validated search params, updating as you move.
 */
export function RouterStateDemo() {
	const search = useSearch({ from: "/slides/tanstack-start" });

	return (
		<DemoShell kicker="typed url state · live" title="The deck's own URL is the state">
			<dl className="grid gap-3">
				<DemoRow label="slide" value={String(search.slide ?? "—")} />
				<DemoRow label="step" value={String(search.step ?? "—")} />
				<DemoRow label="live" value={search.live ?? "—"} />
				<DemoRow label="presenter" value={String(search.presenter ?? false)} />
			</dl>
			<p className="mt-5 font-sans text-xl text-foreground/70">
				These are validated by <Code>validateSearch</Code> on this route. A junk value like{" "}
				<Code>?slide=banana</Code> coerces away instead of breaking the deck.
			</p>
		</DemoShell>
	);
}

/**
 * Typed server boundary — calls the real GET server function from the browser.
 * Middleware tags which side initiated the call and injects server-only context.
 */
export function ServerBoundaryDemo() {
	const getSnapshot = useServerFn(getBoundarySnapshot);
	const [snapshot, setSnapshot] = useState<BoundarySnapshot | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	async function call() {
		setIsLoading(true);
		try {
			setSnapshot(await getSnapshot());
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		void call();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<DemoShell kicker="typed server boundary · live" title="Client → middleware → server">
			{snapshot ? (
				<dl className="grid gap-3">
					<DemoRow label="client context" value={snapshot.clientRuntime} />
					<DemoRow label="server context" value={snapshot.serverRuntime} />
					<DemoRow label="request id" value={snapshot.requestId} />
					<DemoRow label="server-only fn" value={snapshot.boundaryLabel} />
				</dl>
			) : (
				<p className="font-mono text-lg text-foreground/55">calling server function…</p>
			)}
			<DemoButton onClick={() => void call()} disabled={isLoading}>
				{isLoading ? "Calling…" : "Call server function again"}
			</DemoButton>
		</DemoShell>
	);
}

/**
 * Streaming SSR — perceived. The shell renders now; the slow panel arrives after a
 * real server round-trip carrying a deliberate delay. (A client-rendered slide has
 * no loader to defer, so this shows the same visible behavior via a server call;
 * the true loader-deferred variant runs on real pages like `/stats`.)
 */
export function StreamingDemo() {
	const runStreaming = useServerFn(getStreamingData);
	const [data, setData] = useState<StreamingData | null>(null);
	const [isStreaming, setIsStreaming] = useState(false);

	async function stream() {
		setIsStreaming(true);
		setData(null);
		try {
			setData(await runStreaming());
		} finally {
			setIsStreaming(false);
		}
	}

	useEffect(() => {
		void stream();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<DemoShell kicker="streaming SSR · deferred data" title="Shell now, slow data later">
			{isStreaming || !data ? (
				<div className="animate-pulse">
					<div className="h-5 w-48 rounded-sm bg-foreground/15" />
					<div className="mt-5 grid gap-3">
						{[0, 1, 2, 3].map((row) => (
							<div key={row} className="h-5 w-full rounded-sm bg-foreground/10" />
						))}
					</div>
				</div>
			) : (
				<>
					<p className="font-mono text-base text-primary">
						resolved in {data.durationMs}ms · req {data.requestId}
					</p>
					<dl className="mt-4 grid gap-3">
						{data.rows.map((row) => (
							<DemoRow key={row.label} label={row.label} value={row.value} />
						))}
					</dl>
				</>
			)}
			<DemoButton onClick={() => void stream()} disabled={isStreaming}>
				{isStreaming ? `Streaming (~${STREAMING_DEMO_DELAY_MS}ms)…` : "Stream again"}
			</DemoButton>
		</DemoShell>
	);
}

/**
 * RSC as data — renderServerComponent runs a subtree on the server and returns the
 * rendered output through a server function. The client composes it, never importing
 * the component's code or its server-only inputs.
 */
export function RscDemo() {
	const fetchRsc = useServerFn(getRscPanel);
	const [rsc, setRsc] = useState<{ renderedAtIso: string; Renderable: ReactNode } | null>(null);
	const [clientClicks, setClientClicks] = useState(0);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		void fetchRsc()
			.then((result) => setRsc(result as { renderedAtIso: string; Renderable: ReactNode }))
			.catch((cause: unknown) => setError(cause instanceof Error ? cause.message : String(cause)));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<DemoShell
			kicker="react server components · live"
			title="A server subtree, composed by the client"
		>
			{error ? (
				<p className="font-mono text-lg text-red-500">RSC round-trip failed: {error}</p>
			) : rsc ? (
				<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
					{rsc.Renderable}
					<aside className="rounded-global border border-foreground/10 bg-foreground/[0.03] p-5">
						<p className="font-mono text-sm text-primary uppercase">client island</p>
						<p className="mt-2 font-sans text-lg text-foreground/75">
							Ordinary client React, sitting next to the server-rendered panel.
						</p>
						<DemoButton onClick={() => setClientClicks((value) => value + 1)}>
							Client clicks: {clientClicks}
						</DemoButton>
						<p className="mt-3 font-mono text-sm text-foreground/45">
							server subtree built at {rsc.renderedAtIso}
						</p>
					</aside>
				</div>
			) : (
				<p className="font-mono text-lg text-foreground/55">rendering server subtree…</p>
			)}
		</DemoShell>
	);
}

/**
 * Composite slots — `createCompositeComponent` builds a card on the server whose
 * function props are slots. The client fills them: `renderMeta` is a render-prop
 * slot that receives *server* data (request id, render time), and `children` is a
 * plain interactive client island. The server tree stays on the server; the
 * client composes into it. The inverse of the App Router footgun.
 */
export function CompositeSlotsDemo() {
	const fetchCard = useServerFn(getCompositeCard);
	const [card, setCard] = useState<Awaited<ReturnType<typeof getCompositeCard>> | null>(null);
	const [clientClicks, setClientClicks] = useState(0);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		void fetchCard()
			.then(setCard)
			.catch((cause: unknown) => setError(cause instanceof Error ? cause.message : String(cause)));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<DemoShell kicker="composite slots · live" title="A server card, client-filled slots">
			{error ? (
				<p className="font-mono text-lg text-red-500">Composite round-trip failed: {error}</p>
			) : card ? (
				<CompositeComponent
					src={card.src}
					renderMeta={({ renderedAtIso, requestId }) => (
						<div className="rounded-global border border-foreground/10 bg-foreground/[0.03] p-4">
							<p className="font-mono text-sm text-primary uppercase">
								client island · filled a server slot
							</p>
							<dl className="mt-3 grid gap-3">
								<DemoRow label="server request id" value={requestId} />
								<DemoRow label="server rendered at" value={renderedAtIso} />
							</dl>
						</div>
					)}
				>
					<DemoButton onClick={() => setClientClicks((value) => value + 1)}>
						Client clicks: {clientClicks}
					</DemoButton>
				</CompositeComponent>
			) : (
				<p className="font-mono text-lg text-foreground/55">opening server slots…</p>
			)}
		</DemoShell>
	);
}
