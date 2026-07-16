"use client";

/**
 * Tiered achievement map for /foobar. Every catalogue achievement remains
 * visible, while persisted clue IDs control the explicit four-step hint ladder.
 */
import { cn } from "@/lib/helpers/utils";

import { useGlobalStore } from "../global";
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
						clueIds={clues_seen.map(({ id }) => id)}
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
	clueIds: Array<FoobarClueId>;
	recordFoobarClue: (id: FoobarClueId) => void;
} & Pick<FoobarDataType, "completed" | "all_achievements">;

const TierSection = ({
	tier,
	achievements,
	completed,
	all_achievements,
	clueIds,
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
						clueIds={clueIds}
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
	clueIds: Array<FoobarClueId>;
	recordFoobarClue: (id: FoobarClueId) => void;
};

const Badge = ({ achievement, isUnlocked, clueIds, recordFoobarClue }: BadgeProps) => {
	const metadata = FOOBAR_ACHIEVEMENTS[achievement];
	const revealedHints = metadata.hints.filter((hint) => clueIds.includes(hint.id));
	const nextHint = metadata.hints.find((hint) => !clueIds.includes(hint.id));
	const nextHintNumber = revealedHints.length + 1;
	const { icon: Icon, description } = FOOBAR_FLAGS[achievement];

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
						{nextHint && (
							<button
								type="button"
								onClick={() => recordFoobarClue(nextHint.id)}
								className="mt-3 rounded-global border border-primary px-3 py-2 font-mono text-xs text-primary transition-colors hover:bg-primary hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
								aria-label={`Reveal hint ${nextHintNumber} of 4 for ${achievement}`}
							>
								Reveal hint {nextHintNumber} of 4
							</button>
						)}
					</>
				)}
			</div>
		</article>
	);
};
