"use client";

/**
 * A transient, non-persisted acknowledgement for newly earned Foobar badges.
 * Progress is already durable before an achievement enters this queue, so
 * closing, refreshing, or reducing motion can never lose an unlock. It is
 * always drawn in the Karma palette, even on light pages, as a glimpse of
 * /foobar.
 */
import { useEffect } from "react";

import { useGlobalStore } from "@/lib/domains/global";

import { FOOBAR_ACHIEVEMENTS, getFoobarStar } from "./catalog";
import { FOOBAR_FLAGS } from "./flags";
import { FOOBAR_GLOW_CLASS, FOOBAR_STAR_TEXT_CLASS, FOOBAR_TIER_TEXT_CLASS } from "./karma";

const DISMISS_DELAY_MS = 5_000;
// Shown only before /foobar is unlocked, so early discoveries hint that the game exists.
const LOCKED_NUDGE = "Something on this site is keeping score.";

export const FoobarAchievementReveal = () => {
	const achievement = useGlobalStore((state) => state.foobar_reveal_queue[0]);
	const dismissFoobarReveal = useGlobalStore((state) => state.dismissFoobarReveal);
	const unlocked = useGlobalStore((state) => state.foobar_data.unlocked);
	const foobarData = useGlobalStore((state) => state.foobar_data);

	useEffect(() => {
		if (!achievement) return;

		const dismissTimer = window.setTimeout(dismissFoobarReveal, DISMISS_DELAY_MS);

		return () => {
			window.clearTimeout(dismissTimer);
		};
	}, [achievement, dismissFoobarReveal]);

	if (!achievement) return null;

	const { completion, title, tier } = FOOBAR_ACHIEVEMENTS[achievement];
	const { icon: Icon } = FOOBAR_FLAGS[achievement];
	const star = getFoobarStar(achievement, foobarData);

	return (
		<aside
			className={`fixed right-4 bottom-4 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden border border-karma-rule bg-karma-background text-left font-mono text-sm text-[var(--not-white)] shadow-[0_8px_28px_rgb(0_0_0/0.45)] [font-variant-ligatures:none] ${FOOBAR_TIER_TEXT_CLASS[tier]}`}
			data-testid="foobar-achievement-reveal"
		>
			<p className="sr-only" aria-live="polite">
				Discovery collected: {title}. {completion.note}
				{star ? ` It earned a ${star} star.` : null}
				{unlocked ? null : ` ${LOCKED_NUDGE}`}
			</p>
			<div className="h-0.5 bg-current" />
			<div className="flex items-start gap-3 p-4">
				<div className="grid size-11 shrink-0 place-items-center rounded-full border border-current [box-shadow:0_0_12px_currentColor]">
					<Icon aria-hidden="true" className={`text-xl ${FOOBAR_GLOW_CLASS}`} />
				</div>
				<div className="min-w-0 flex-1">
					<div className="animate-reveal-title motion-reduce:animate-none" key={achievement}>
						<p className="text-xs text-karma-comment">--- discovery collected ---</p>
						<p className="mt-1 font-bold text-[var(--not-white)] [text-shadow:0_0_5px_rgb(247_241_255/0.5)]">
							{title}
							{star ? (
								<span className={`ml-[1ch] ${FOOBAR_STAR_TEXT_CLASS[star]} ${FOOBAR_GLOW_CLASS}`}>
									*
								</span>
							) : null}
						</p>
						<p className="mt-1 leading-relaxed text-[var(--not-white)]/75">{completion.note}</p>
						{unlocked ? null : <p className="mt-2 text-xs text-karma-yellow">{LOCKED_NUDGE}</p>}
					</div>
				</div>
				<button
					aria-label={`Dismiss ${title} achievement notification`}
					className="-mt-2 -mr-2 inline-flex size-11 shrink-0 items-center justify-center text-karma-comment transition-colors hover:text-[var(--not-white)] focus-visible:outline-2 focus-visible:outline-karma-yellow"
					onClick={dismissFoobarReveal}
					type="button"
				>
					<span aria-hidden="true">[x]</span>
				</button>
			</div>
		</aside>
	);
};
