"use client";

/**
 * Tiered achievement map for /foobar. Every catalogue achievement remains
 * visible, while persisted clue IDs control the explicit four-step hint ladder.
 */
import { useEffect, useState } from "react";

import { cn } from "@/lib/helpers/utils";

import { useGlobalStore } from "../global";
import { useCustomPlausible } from "../Plausible";
import {
	FOOBAR_ACHIEVEMENTS,
	FOOBAR_TIERS,
	FOOBAR_TIER_ORDER,
	FOOBAR_TEASERS,
	isFoobarAchievement,
	type FoobarAchievement,
	type FoobarClueId,
	type FoobarTier,
} from "./catalog";
import { FOOBAR_FLAGS } from "./flags";
import {
	FOOBAR_HINT_DEVELOPMENT_MS,
	formatFoobarHintRemaining,
	getFoobarHintDevelopment,
	getFoobarHintElapsedBucket,
} from "./hint-development";
import { type FoobarDataType } from "./store";

type ShowCompletedBadgesProps = Pick<
	FoobarDataType,
	"completed" | "all_achievements" | "clues_seen"
>;

export const ShowCompletedBadges = ({
	completed,
	all_achievements,
	clues_seen,
}: ShowCompletedBadgesProps) => {
	const recordFoobarClue = useGlobalStore((state) => state.recordFoobarClue);
	const achievements = Object.keys(FOOBAR_ACHIEVEMENTS).filter(isFoobarAchievement);

	return (
		<div className="pt-24">
			<h2 className="font-serif text-4xl leading-normal">Achievement map</h2>
			<p className="mt-3 max-w-2xl text-foreground/75">
				Trace the site from its visible edges down to the protocols beneath it. Locked challenges
				stay on the map, and every hint you reveal is saved to your field notes.
			</p>
			<div className="mt-10 grid gap-10">
				{FOOBAR_TIER_ORDER.map((tier) => (
					<TierSection
						key={tier}
						tier={tier}
						achievements={achievements.filter(
							(achievement) => FOOBAR_ACHIEVEMENTS[achievement].tier === tier,
						)}
						completed={completed}
						all_achievements={all_achievements}
						cluesSeen={clues_seen}
						recordFoobarClue={recordFoobarClue}
					/>
				))}
			</div>
		</div>
	);
};

type TierSectionProps = {
	tier: FoobarTier;
	achievements: Array<FoobarAchievement>;
	cluesSeen: FoobarDataType["clues_seen"];
	recordFoobarClue: (id: FoobarClueId) => void;
} & Pick<FoobarDataType, "completed" | "all_achievements">;

const TierSection = ({
	tier,
	achievements,
	completed,
	all_achievements,
	cluesSeen,
	recordFoobarClue,
}: TierSectionProps) => {
	const metadata = FOOBAR_TIERS[tier];
	const completedCount = achievements.filter((achievement) =>
		achievement === "completed" ? all_achievements : completed.includes(achievement),
	).length;

	return (
		<section aria-labelledby={`foobar-tier-${tier}`}>
			<header className="mb-4 flex flex-col gap-2 border-b border-foreground/15 pb-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h3 id={`foobar-tier-${tier}`} className="font-serif text-2xl leading-normal">
						{metadata.label}
					</h3>
					<p className="mt-1 text-sm text-foreground/70">{metadata.description}</p>
				</div>
				<div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-foreground/70">
					<span>Difficulty {metadata.difficulty} / 5</span>
					<span>
						{completedCount} / {achievements.length} complete
					</span>
				</div>
			</header>
			<div className="grid gap-4 md:grid-cols-2">
				{achievements.map((achievement) => (
					<Badge
						key={achievement}
						achievement={achievement}
						isUnlocked={
							achievement === "completed" ? all_achievements : completed.includes(achievement)
						}
						cluesSeen={cluesSeen}
						recordFoobarClue={recordFoobarClue}
					/>
				))}
			</div>
		</section>
	);
};

type BadgeProps = {
	achievement: FoobarAchievement;
	isUnlocked: boolean;
	cluesSeen: FoobarDataType["clues_seen"];
	recordFoobarClue: (id: FoobarClueId) => void;
};

const Badge = ({ achievement, isUnlocked, cluesSeen, recordFoobarClue }: BadgeProps) => {
	const plausibleEvent = useCustomPlausible();
	const metadata = FOOBAR_ACHIEVEMENTS[achievement];
	const clueIds = cluesSeen.map(({ id }) => id);
	const revealedHints = metadata.hints.filter((hint) => clueIds.includes(hint.id));
	const nextHint = metadata.hints.find((hint) => !clueIds.includes(hint.id));
	const nextHintNumber = revealedHints.length + 1;
	const hint3SeenAt = cluesSeen.find(({ id }) => id === metadata.hints[2]?.id)?.seen_at;
	const { icon: Icon, description } = FOOBAR_FLAGS[achievement];
	const revealNextHint = () => {
		if (!nextHint) return;

		recordFoobarClue(nextHint.id);
		if (nextHint.id === metadata.hints[2]?.id) {
			plausibleEvent("foobar_hint_development_started", {
				props: {
					achievement,
					wait_hours: FOOBAR_HINT_DEVELOPMENT_MS / (60 * 60 * 1_000),
				},
			});
		}
	};
	const readDevelopedHint = () => {
		if (!nextHint || hint3SeenAt === undefined) return;

		recordFoobarClue(nextHint.id);
		plausibleEvent("foobar_developed_hint_read", {
			props: {
				achievement,
				elapsed_bucket: getFoobarHintElapsedBucket(hint3SeenAt, Date.now()),
			},
		});
	};

	return (
		<article
			className={cn(
				"grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-4 rounded-global border border-foreground/15 bg-foreground/5 p-4 transition-colors dark:bg-foreground/10",
				isUnlocked ? "text-foreground" : "text-foreground/60",
			)}
		>
			<Icon
				aria-hidden="true"
				className={cn("mt-1 text-4xl", isUnlocked ? "text-primary" : "text-foreground/35")}
			/>
			<div className="min-w-0">
				<div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
					<h4 className="font-mono text-base font-semibold break-words text-current">
						{achievement}
					</h4>
					<span className="font-mono text-xs">{isUnlocked ? "Complete" : "Unsolved"}</span>
				</div>
				{isUnlocked ? (
					<p className="mt-2 text-sm text-foreground/80">{description}</p>
				) : (
					<>
						<p className="mt-2 text-sm text-foreground/70">{FOOBAR_TEASERS[achievement]}</p>
						{revealedHints.length > 0 && (
							<ol className="mt-3 grid gap-2 text-sm text-foreground/80">
								{revealedHints.map((hint, index) => (
									<li key={hint.id}>
										<span className="font-mono text-xs text-primary">Hint {index + 1}</span>
										<span className="block break-words">{hint.text}</span>
									</li>
								))}
							</ol>
						)}
						{nextHint && nextHintNumber <= 3 && (
							<button
								type="button"
								onClick={revealNextHint}
								className="mt-3 rounded-global border border-primary px-3 py-2 font-mono text-xs text-primary transition-colors hover:bg-primary hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
								aria-label={`Reveal hint ${nextHintNumber} of 4 for ${achievement}`}
							>
								Reveal hint {nextHintNumber} of 4
							</button>
						)}
						{nextHint && nextHintNumber === 4 && (
							<DevelopingHint
								achievement={achievement}
								hint3SeenAt={hint3SeenAt}
								onRead={readDevelopedHint}
							/>
						)}
					</>
				)}
			</div>
		</article>
	);
};

type DevelopingHintProps = {
	achievement: FoobarAchievement;
	hint3SeenAt: number | null | undefined;
	onRead: () => void;
};

const DevelopingHint = ({ achievement, hint3SeenAt, onRead }: DevelopingHintProps) => {
	const [now, setNow] = useState(Date.now);
	const development = getFoobarHintDevelopment(hint3SeenAt, now);

	useEffect(() => {
		if (hint3SeenAt === undefined || hint3SeenAt === null) return;

		const initialDevelopment = getFoobarHintDevelopment(hint3SeenAt, Date.now());
		if (initialDevelopment.status !== "developing") return;

		const updateDevelopment = () => setNow(Date.now());
		const interval = window.setInterval(updateDevelopment, 60 * 1_000);
		const deadline = window.setTimeout(
			updateDevelopment,
			Math.max(0, initialDevelopment.availableAt - Date.now()),
		);
		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") updateDevelopment();
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			window.clearInterval(interval);
			window.clearTimeout(deadline);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [development.status, hint3SeenAt]);

	if (development.status === "not-started") return null;

	if (development.status === "ready") {
		return (
			<button
				type="button"
				onClick={onRead}
				className="mt-3 rounded-global border border-primary px-3 py-2 font-mono text-xs text-primary transition-colors hover:bg-primary hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
				aria-label={`Read developed hint 4 of 4 for ${achievement}`}
			>
				Read developed hint
			</button>
		);
	}

	return (
		<div className="mt-3 rounded-global border border-foreground/15 bg-background/40 p-3">
			<p className="font-mono text-xs text-primary">Hint 4 · Developing</p>
			<div aria-hidden="true" className="mt-3 grid max-w-xs gap-2 opacity-35 blur-[2px]">
				<span className="h-2 w-full rounded-full bg-foreground" />
				<span className="h-2 w-4/5 rounded-full bg-foreground" />
				<span className="h-2 w-2/3 rounded-full bg-foreground" />
			</div>
			<p className="mt-3 text-sm text-foreground/70">
				The ink is still drying. Return in {formatFoobarHintRemaining(development.remainingMs)}.
			</p>
		</div>
	);
};
