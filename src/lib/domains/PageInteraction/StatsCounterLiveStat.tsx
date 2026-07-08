/**
 * Deferred live-viewer stat.
 * The WebSocket and presence parser are intentionally kept out of the initial
 * stats bundle so above-the-fold text can paint before realtime UI connects.
 */
"use client";

import { useEffect, useState } from "react";
import { FaRegCircleUser } from "react-icons/fa6";

import { useLiveViewerCount } from "@/lib/components/useLiveViewerCount";
import { cn } from "@/lib/helpers/utils";

const statItemClassName = "flex items-center justify-center gap-1.5";
const statValueClassName = "inline-block min-w-[2ch] text-left tabular-nums";
const statTooltipTriggerClassName = "group relative";
// Transition is added post-mount (see `tooltipTransitionReady`) so the tooltip
// doesn't animate opacity 1→0 when this deferred island mounts client-side —
// that insert-time transition caused a brief tooltip flash without hover.
const statTooltipBubbleClassName =
	"pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-64 -translate-x-1/2 rounded-global border border-solid border-foreground/15 bg-background px-2.5 py-1.5 text-center text-xs leading-snug text-foreground opacity-0 shadow-lg group-hover:opacity-100 group-focus-within:opacity-100";

export const StatsCounterLiveStat = () => {
	const { count, connected } = useLiveViewerCount();

	const [tooltipTransitionReady, setTooltipTransitionReady] = useState(false);
	useEffect(() => {
		if (count === null || tooltipTransitionReady) return;
		const id = requestAnimationFrame(() => setTooltipTransitionReady(true));
		return () => cancelAnimationFrame(id);
	}, [count, tooltipTransitionReady]);

	if (count === null) {
		return (
			<div className={statItemClassName}>
				<dt className="sr-only">Live viewers across the site</dt>
				<dd className="m-0 inline-flex min-h-5 items-center gap-1.5">
					<FaRegCircleUser
						aria-hidden="true"
						focusable={false}
						className="size-5 rounded-full text-primary"
					/>
					<span
						aria-hidden="true"
						className="h-4 w-[2ch] animate-pulse rounded-full bg-foreground/15"
					/>
					<span className="sr-only">Loading live viewers across the site</span>
				</dd>
			</div>
		);
	}

	const formattedCount = count.toLocaleString();
	const liveViewerUnit = count === 1 ? "live viewer" : "live viewers";
	const label = `${formattedCount} ${liveViewerUnit} across the site`;
	const tooltipContent = `There ${count === 1 ? "is" : "are"} ${label} right now.`;

	return (
		<div className={statItemClassName}>
			<dt className="sr-only">Live viewers across the site</dt>
			<dd
				className={cn("m-0 inline-flex items-center gap-1.5", statTooltipTriggerClassName)}
				aria-label={label}
			>
				<span
					aria-hidden="true"
					className="relative inline-flex size-5 items-center justify-center"
				>
					{connected ? (
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75 animate-duration-[1000ms] motion-reduce:animate-none" />
					) : null}
					<FaRegCircleUser
						aria-hidden="true"
						focusable={false}
						className="relative inline-flex size-5 rounded-full text-primary"
					/>
				</span>
				<span aria-hidden="true" className={statValueClassName}>
					{formattedCount}
				</span>
				<span
					aria-hidden="true"
					className={cn(
						statTooltipBubbleClassName,
						tooltipTransitionReady && "transition-opacity duration-100",
					)}
				>
					{tooltipContent}
					<span
						aria-hidden="true"
						className="absolute top-full left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-r border-b border-solid border-foreground/15 bg-background"
					/>
				</span>
			</dd>
		</div>
	);
};
