"use client";

/**
 * The Foobar field guide keeps the hunt scannable: unresolved challenges are
 * compact until selected, while completed discoveries move into a quieter
 * collectible drawer. The parent owns the selected achievement so Field Notes
 * can reopen the exact challenge that produced a clue.
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
> & {
	activeAchievement: FoobarAchievement | undefined;
	onSelectAchievement: (achievement: FoobarAchievement) => void;
	onCollapseAchievement: () => void;
};

export const ShowCompletedBadges = ({
	completed,
	all_achievements,
	clues_seen,
	activeAchievement,
	onSelectAchievement,
	onCollapseAchievement,
}: ShowCompletedBadgesProps) => {
	const recordFoobarClue = useGlobalStore((state) => state.recordFoobarClue);
	const achievements = Object.keys(FOOBAR_ACHIEVEMENTS).filter(isFoobarAchievement);
	const isComplete = (achievement: FoobarAchievement) =>
		achievement === "completed" ? all_achievements : completed.includes(achievement);
	const completedCount = achievements.filter(isComplete).length;
	const nextAchievement = achievements.find((achievement) => !isComplete(achievement));
	const progress = Math.round((completedCount / achievements.length) * 100);

	return (
		<div className="min-w-0 pt-14 sm:pt-20">
			<header className="border-b-2 border-primary/25 pb-8">
				<p className="font-mono text-xs font-semibold tracking-[0.18em] text-primary uppercase">
					Hidden in plain sight
				</p>
				<div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h1 className="font-serif text-5xl leading-none sm:text-6xl">Foobar</h1>
						<p className="mt-2 font-serif text-xl text-foreground/70">
							A hunter&apos;s field guide
						</p>
					</div>
					<div className="min-w-44 font-mono text-xs text-foreground/70">
						<div className="flex items-center justify-between gap-4">
							<span>Map surveyed</span>
							<strong className="text-foreground">
								{completedCount} / {achievements.length}
							</strong>
						</div>
						<div
							aria-label={`${progress}% of the Foobar map complete`}
							aria-valuemax={100}
							aria-valuemin={0}
							aria-valuenow={progress}
							className="mt-2 h-2 overflow-hidden rounded-full bg-foreground/10"
							role="progressbar"
						>
							<span className="block h-full bg-primary" style={{ width: `${progress}%` }} />
						</div>
					</div>
				</div>
				<p className="mt-6 max-w-2xl text-pretty text-foreground/75">
					Trace the visible edges of the site down to the odd protocols beneath it. The map
					remembers every clue you choose to uncover.
				</p>
				<div className="mt-6 flex flex-wrap items-center gap-3">
					{nextAchievement ? (
						<button
							className="inline-flex min-h-11 items-center rounded-global bg-primary px-5 py-2 text-sm font-semibold text-background transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
							onClick={() => onSelectAchievement(nextAchievement)}
							type="button"
						>
							Continue hunting
						</button>
					) : (
						<p className="font-serif text-lg text-primary">Every trail on the map is marked.</p>
					)}
					<span className="text-sm text-foreground/60">
						{nextAchievement
							? `Next lead: ${FOOBAR_ACHIEVEMENTS[nextAchievement].title}`
							: "The field guide is complete."}
					</span>
				</div>
				<nav aria-label="Foobar map waypoints" className="mt-6 flex flex-wrap gap-2">
					{FOOBAR_TIER_ORDER.map((tier, index) => (
						<a
							className="inline-flex min-h-11 items-center gap-2 rounded-full border border-foreground/15 px-3 py-2 font-mono text-xs text-foreground/70 transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
							href={`#foobar-tier-${tier}`}
							key={tier}
						>
							<span aria-hidden="true">0{index + 1}</span>
							{FOOBAR_TIERS[tier].label}
						</a>
					))}
				</nav>
			</header>

			<div className="mt-12 grid gap-14">
				{FOOBAR_TIER_ORDER.map((tier, index) => (
					<TierSection
						key={tier}
						tier={tier}
						marker={index + 1}
						achievements={achievements.filter(
							(achievement) => FOOBAR_ACHIEVEMENTS[achievement].tier === tier,
						)}
						completed={completed}
						all_achievements={all_achievements}
						cluesSeen={clues_seen}
						recordFoobarClue={recordFoobarClue}
						activeAchievement={activeAchievement}
						onSelectAchievement={onSelectAchievement}
						onCollapseAchievement={onCollapseAchievement}
					/>
				))}
			</div>
		</div>
	);
};

type TierSectionProps = {
	tier: FoobarTier;
	marker: number;
	achievements: Array<FoobarAchievement>;
	cluesSeen: FoobarDataType["clues_seen"];
	recordFoobarClue: (id: FoobarClueId) => void;
	activeAchievement: FoobarAchievement | undefined;
	onSelectAchievement: (achievement: FoobarAchievement) => void;
	onCollapseAchievement: () => void;
} & Pick<FoobarDataType, "completed" | "all_achievements">;

const TierSection = ({
	tier,
	marker,
	achievements,
	completed,
	all_achievements,
	cluesSeen,
	recordFoobarClue,
	activeAchievement,
	onSelectAchievement,
	onCollapseAchievement,
}: TierSectionProps) => {
	const metadata = FOOBAR_TIERS[tier];
	const completedAchievements = achievements.filter((achievement) =>
		achievement === "completed" ? all_achievements : completed.includes(achievement),
	);
	const unresolvedAchievements = achievements.filter(
		(achievement) => !completedAchievements.includes(achievement),
	);

	return (
		<section aria-labelledby={`foobar-tier-${tier}`} className="scroll-mt-24">
			<header className="mb-5 grid grid-cols-[auto_minmax(0,1fr)] gap-4 border-b border-foreground/15 pb-5">
				<div
					aria-hidden="true"
					className="grid size-11 place-items-center rounded-full border-2 border-primary/40 font-mono text-xs font-semibold text-primary"
				>
					{String(marker).padStart(2, "0")}
				</div>
				<div className="min-w-0">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<h2 id={`foobar-tier-${tier}`} className="font-serif text-3xl leading-normal">
								{metadata.label}
							</h2>
							<p className="mt-1 text-sm text-foreground/70">{metadata.description}</p>
						</div>
						<p className="font-mono text-xs text-foreground/65">
							{completedAchievements.length} / {achievements.length} collected
						</p>
					</div>
					<div
						className="mt-3 flex items-center gap-2"
						aria-label={`Difficulty ${metadata.difficulty} of 5`}
					>
						<span className="font-mono text-[0.7rem] text-foreground/55">Trail difficulty</span>
						<span aria-hidden="true" className="flex gap-1">
							{[1, 2, 3, 4, 5].map((difficulty) => (
								<span
									className={cn(
										"size-1.5 rounded-full",
										difficulty <= metadata.difficulty ? "bg-primary" : "bg-foreground/15",
									)}
									key={difficulty}
								/>
							))}
						</span>
					</div>
				</div>
			</header>

			{unresolvedAchievements.length > 0 ? (
				<div className="grid gap-3">
					{unresolvedAchievements.map((achievement) => (
						<Badge
							key={achievement}
							achievement={achievement}
							isExpanded={activeAchievement === achievement}
							cluesSeen={cluesSeen}
							recordFoobarClue={recordFoobarClue}
							onToggle={() =>
								activeAchievement === achievement
									? onCollapseAchievement()
									: onSelectAchievement(achievement)
							}
						/>
					))}
				</div>
			) : (
				<p className="rounded-global border border-primary/25 bg-primary/5 p-4 text-sm text-foreground/75">
					Every trail in this territory has been marked.
				</p>
			)}

			{completedAchievements.length > 0 ? (
				<CompletedCollection achievements={completedAchievements} />
			) : null}
		</section>
	);
};

const CompletedCollection = ({ achievements }: { achievements: Array<FoobarAchievement> }) => (
	<details className="group mt-4 rounded-global border border-primary/20 bg-primary/[0.035]">
		<summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-medium marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
			<span className="flex items-center gap-2">
				<span aria-hidden="true" className="text-primary">
					✦
				</span>
				Collected discoveries
			</span>
			<span className="font-mono text-xs text-foreground/60 group-open:hidden">
				{achievements.length} filed
			</span>
			<span className="hidden font-mono text-xs text-foreground/60 group-open:inline">
				Close drawer
			</span>
		</summary>
		<div className="grid gap-2 border-t border-primary/15 p-3 sm:grid-cols-2">
			{achievements.map((achievement) => {
				const metadata = FOOBAR_ACHIEVEMENTS[achievement];
				const { icon: Icon, description } = FOOBAR_FLAGS[achievement];

				return (
					<article
						className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-3 border-l-2 border-primary bg-background/70 p-3"
						id={`foobar-achievement-${achievement}`}
						key={achievement}
					>
						<div className="grid size-9 place-items-center rounded-full bg-primary text-background">
							<Icon aria-hidden="true" className="text-lg" />
						</div>
						<div className="min-w-0">
							<div className="flex flex-wrap items-baseline justify-between gap-2">
								<h3 className="font-serif text-base font-semibold break-words">{metadata.title}</h3>
								<span className="font-mono text-[0.65rem] font-semibold tracking-wide text-primary uppercase">
									Collected
								</span>
							</div>
							<p className="mt-1 text-xs leading-relaxed text-foreground/70">{description}</p>
						</div>
					</article>
				);
			})}
		</div>
	</details>
);

type BadgeProps = {
	achievement: FoobarAchievement;
	isExpanded: boolean;
	cluesSeen: FoobarDataType["clues_seen"];
	recordFoobarClue: (id: FoobarClueId) => void;
	onToggle: () => void;
};

const Badge = ({ achievement, isExpanded, cluesSeen, recordFoobarClue, onToggle }: BadgeProps) => {
	const plausibleEvent = useCustomPlausible();
	const [recordedHint, setRecordedHint] = useState<number | null>(null);
	const metadata = FOOBAR_ACHIEVEMENTS[achievement];
	const clueIds = cluesSeen.map(({ id }) => id);
	const revealedHints = metadata.hints.flatMap((hint, index) =>
		clueIds.includes(hint.id) ? [{ hint, number: index + 1 }] : [],
	);
	const nextHintIndex = metadata.hints.findIndex((hint) => !clueIds.includes(hint.id));
	const nextHint = nextHintIndex === -1 ? undefined : metadata.hints[nextHintIndex];
	const nextHintNumber = nextHintIndex + 1;
	const hint3SeenAt = cluesSeen.find(({ id }) => id === metadata.hints[2]?.id)?.seen_at;
	const finalHint = metadata.hints[3];
	const { icon: Icon } = FOOBAR_FLAGS[achievement];
	const revealNextHint = () => {
		if (!nextHint) return;

		recordFoobarClue(nextHint.id);
		setRecordedHint(nextHintNumber);
		if (nextHint.id === metadata.hints[2]?.id && finalHint && !clueIds.includes(finalHint.id)) {
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
		setRecordedHint(nextHintNumber);
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
				"scroll-mt-24 rounded-global border bg-background transition-[border-color,box-shadow]",
				isExpanded
					? "border-primary/50 shadow-[inset_3px_0_0_var(--color-primary)]"
					: "border-foreground/15 hover:border-primary/30",
			)}
			id={`foobar-achievement-${achievement}`}
		>
			<div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-3 sm:p-4">
				<div className="grid size-10 place-items-center rounded-full border border-foreground/15 bg-foreground/5 text-foreground/45">
					<Icon aria-hidden="true" className="text-xl" />
				</div>
				<div className="min-w-0">
					<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
						<h3 className="font-serif text-lg font-semibold break-words">{metadata.title}</h3>
						<span className="font-mono text-[0.65rem] tracking-wide text-foreground/50 uppercase">
							Unsolved
						</span>
					</div>
					<p className="mt-1 text-sm text-foreground/65">{FOOBAR_TEASERS[achievement]}</p>
				</div>
				<button
					aria-controls={`foobar-achievement-details-${achievement}`}
					aria-expanded={isExpanded}
					aria-label={`${isExpanded ? "Close" : "Open"} field entry for ${metadata.title}`}
					className="inline-flex size-11 items-center justify-center rounded-full border border-foreground/15 font-mono text-lg text-foreground/65 transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
					id={`foobar-achievement-trigger-${achievement}`}
					onClick={onToggle}
					type="button"
				>
					<span aria-hidden="true">{isExpanded ? "−" : "+"}</span>
				</button>
			</div>

			{isExpanded ? (
				<div
					className="border-t border-foreground/10 px-4 pt-4 pb-5 sm:ml-[4.25rem] sm:px-0 sm:pr-5"
					id={`foobar-achievement-details-${achievement}`}
				>
					{revealedHints.length > 0 ? (
						<ol className="grid gap-3 text-sm text-foreground/80">
							{revealedHints.map(({ hint, number }) => (
								<li className="border-l-2 border-primary/35 pl-3" key={hint.id}>
									<span className="font-mono text-xs text-primary">Field note {number}</span>
									<span className="mt-0.5 block break-words">{hint.text}</span>
								</li>
							))}
						</ol>
					) : (
						<p className="text-sm text-foreground/65">
							No notes on this trail yet. Ask the guide for a nudge when you want one.
						</p>
					)}

					{recordedHint !== null ? (
						<p className="mt-4 text-sm text-foreground/70" role="status">
							Field note {recordedHint} recorded.{" "}
							<a
								className="font-medium text-primary underline underline-offset-4"
								href="#foobar-field-notes"
							>
								Read it in Field Notes
							</a>
							.
						</p>
					) : null}

					{nextHint && nextHintNumber <= 3 ? (
						<button
							aria-label={`Reveal hint ${nextHintNumber} of 4 for ${metadata.title}`}
							className="mt-4 inline-flex min-h-11 items-center rounded-global border border-primary px-4 py-2 font-mono text-xs text-primary transition-colors hover:bg-primary hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
							onClick={revealNextHint}
							type="button"
						>
							Reveal hint {nextHintNumber} of 4
						</button>
					) : null}
					{nextHint && nextHintNumber === 4 ? (
						<DevelopingHint
							achievement={achievement}
							hint3SeenAt={hint3SeenAt}
							onRead={readDevelopedHint}
						/>
					) : null}
				</div>
			) : null}
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
	const [announcement, setAnnouncement] = useState("");
	const development = getFoobarHintDevelopment(hint3SeenAt, now);

	useEffect(() => {
		if (hint3SeenAt === undefined || hint3SeenAt === null) return;

		const currentNow = Date.now();
		const initialDevelopment = getFoobarHintDevelopment(hint3SeenAt, currentNow);
		if (initialDevelopment.status !== "developing") {
			setNow(currentNow);
			return;
		}

		const updateDevelopment = () => setNow(Date.now());
		const interval = window.setInterval(updateDevelopment, 60 * 1_000);
		const deadline = window.setTimeout(
			updateDevelopment,
			Math.max(0, initialDevelopment.availableAt - currentNow),
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

	useEffect(() => {
		if (development.status === "not-started") {
			setAnnouncement("");
			return;
		}

		const announcementTimer = window.setTimeout(() => {
			setAnnouncement(
				development.status === "developing"
					? "Hint 4 is developing. Return tomorrow."
					: "Hint 4 has developed.",
			);
		}, 0);

		return () => window.clearTimeout(announcementTimer);
	}, [development.status]);

	if (development.status === "not-started") return null;

	return (
		<>
			<p className="sr-only" aria-live="polite">
				{announcement}
			</p>
			{development.status === "ready" ? (
				<button
					aria-label={`Read developed hint 4 of 4 for ${FOOBAR_ACHIEVEMENTS[achievement].title}`}
					className="mt-4 inline-flex min-h-11 items-center rounded-global border border-primary px-4 py-2 font-mono text-xs text-primary transition-colors hover:bg-primary hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
					onClick={onRead}
					type="button"
				>
					Read developed hint
				</button>
			) : (
				<div className="mt-4 rounded-global border border-foreground/15 bg-foreground/[0.035] p-4">
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
			)}
		</>
	);
};
