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
			className="fixed right-4 bottom-4 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-global border border-primary/40 bg-background p-4 shadow-xl"
			data-testid="foobar-achievement-reveal"
		>
			<p className="sr-only" aria-live="polite">
				Achievement unlocked: {title}. {completion.note}
			</p>
			<div className="flex items-start gap-3">
				<Icon aria-hidden="true" className="mt-1 shrink-0 text-3xl text-primary" />
				<div className="min-w-0 flex-1">
					<p className="text-sm text-foreground/80">{completion.note}</p>
					<div
						className={`mt-3 transition-all duration-300 motion-reduce:transition-none ${
							showTitle ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
						}`}
					>
						<p className="font-mono text-xs font-semibold tracking-wide text-primary uppercase">
							Achievement unlocked
						</p>
						<p className="font-serif text-xl leading-normal">{title}</p>
					</div>
				</div>
				<button
					aria-label={`Dismiss ${title} achievement notification`}
					className="rounded-global px-2 py-1 text-sm text-foreground/65 transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
					onClick={dismissFoobarReveal}
					type="button"
				>
					Dismiss
				</button>
			</div>
		</aside>
	);
};
