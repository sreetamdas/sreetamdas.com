"use client";

/**
 * A transient, non-persisted acknowledgement for newly earned Foobar badges.
 * Progress is already durable before an achievement enters this queue, so
 * closing, refreshing, or reducing motion can never lose an unlock.
 */
import { useEffect, useState } from "react";

import { useGlobalStore } from "@/lib/domains/global";

import { FOOBAR_ACHIEVEMENTS } from "./catalog";
import { FOOBAR_FLAGS } from "./flags";

const TITLE_DELAY_MS = 400;
const DISMISS_DELAY_MS = 5_000;

function prefersReducedMotion() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const FoobarAchievementReveal = () => {
	const achievement = useGlobalStore((state) => state.foobar_reveal_queue[0]);
	const dismissFoobarReveal = useGlobalStore((state) => state.dismissFoobarReveal);
	const [showTitle, setShowTitle] = useState(false);

	useEffect(() => {
		if (!achievement) return;

		setShowTitle(false);
		const titleTimer = window.setTimeout(
			() => setShowTitle(true),
			prefersReducedMotion() ? 0 : TITLE_DELAY_MS,
		);
		const dismissTimer = window.setTimeout(dismissFoobarReveal, DISMISS_DELAY_MS);

		return () => {
			window.clearTimeout(titleTimer);
			window.clearTimeout(dismissTimer);
		};
	}, [achievement, dismissFoobarReveal]);

	if (!achievement) return null;

	const { completion, title } = FOOBAR_ACHIEVEMENTS[achievement];
	const { icon: Icon } = FOOBAR_FLAGS[achievement];

	return (
		<aside
			className="fixed right-4 bottom-4 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-global border border-primary/35 bg-background shadow-[0_8px_24px_rgb(0_0_0/0.12)]"
			data-testid="foobar-achievement-reveal"
		>
			<p className="sr-only" aria-live="polite">
				Achievement unlocked: {title}. {completion.note}
			</p>
			<div className="h-1 bg-primary" />
			<div className="flex items-start gap-3 p-4">
				<div className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-background ring-4 ring-primary/10">
					<Icon aria-hidden="true" className="text-2xl" />
				</div>
				<div className="min-w-0 flex-1 pt-0.5">
					<div
						className={`transition-all duration-300 motion-reduce:transition-none ${
							showTitle ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
						}`}
					>
						<p className="font-mono text-[0.65rem] font-semibold tracking-[0.16em] text-primary uppercase">
							Discovery collected
						</p>
						<p className="mt-0.5 font-serif text-xl leading-tight">{title}</p>
						<p className="mt-2 text-sm leading-relaxed text-foreground/70">{completion.note}</p>
					</div>
				</div>
				<button
					aria-label={`Dismiss ${title} achievement notification`}
					className="-mt-1 -mr-1 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-lg text-foreground/55 transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
					onClick={dismissFoobarReveal}
					type="button"
				>
					<span aria-hidden="true">×</span>
				</button>
			</div>
		</aside>
	);
};
