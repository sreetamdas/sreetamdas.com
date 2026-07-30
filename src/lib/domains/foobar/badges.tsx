"use client";

/**
 * Foobar's achievement index deliberately uses the same narrow, text-first
 * language as the rest of the site. The oddness belongs in the discoveries,
 * not in a separate dashboard skin.
 */
import { useEffect, useState } from "react";

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

	return (
		<div className="pt-12 sm:pt-20">
			<header className="pb-8">
				<h1 className="font-serif text-6xl leading-none font-bold sm:text-7xl">/foobar</h1>
				<p className="mt-8 text-pretty">
					There are strange things hiding around this website. Some are obvious. Some are decidedly
					not. This page remembers the ones you find.
				</p>
				<p className="mt-5 font-mono text-sm">
					<strong className="text-primary">{completedCount}</strong> of {achievements.length} weird
					things found.
				</p>
				<div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
					{nextAchievement ? (
						<button
							className="inline-flex min-h-11 items-center link-base font-medium text-primary"
							onClick={() => onSelectAchievement(nextAchievement)}
							type="button"
						>
							<span aria-hidden="true" className="mr-2">
								→
							</span>
							Continue hunting
						</button>
					) : (
						<p className="text-primary">You found everything. Somehow.</p>
					)}
					<span className="text-sm text-foreground/65">
						{nextAchievement
							? `Next: ${FOOBAR_ACHIEVEMENTS[nextAchievement].title}`
							: "That was not supposed to be easy."}
					</span>
				</div>
			</header>

			<div className="mt-8 grid gap-16">
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
	achievements: Array<FoobarAchievement>;
	cluesSeen: FoobarDataType["clues_seen"];
	recordFoobarClue: (id: FoobarClueId) => void;
	activeAchievement: FoobarAchievement | undefined;
	onSelectAchievement: (achievement: FoobarAchievement) => void;
	onCollapseAchievement: () => void;
} & Pick<FoobarDataType, "completed" | "all_achievements">;

const TierSection = ({
	tier,
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

	return (
		<section aria-labelledby={`foobar-tier-${tier}`} className="scroll-mt-24">
			<header className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-4 gap-y-1">
				<div>
					<h2 id={`foobar-tier-${tier}`} className="font-serif text-3xl font-bold">
						{metadata.label}
					</h2>
					<p className="mt-1 text-sm text-foreground/70">{metadata.description}</p>
				</div>
				<p className="font-mono text-xs text-foreground/60">
					{completedAchievements.length} of {achievements.length}
				</p>
			</header>

			<ul className="border-t border-foreground/25">
				{achievements.map((achievement) =>
					completedAchievements.includes(achievement) ? (
						<CompletedAchievement achievement={achievement} key={achievement} />
					) : (
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
					),
				)}
			</ul>
		</section>
	);
};

const CompletedAchievement = ({ achievement }: { achievement: FoobarAchievement }) => (
	<li className="border-b border-foreground/20">
		<article
			className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-2 py-4"
			id={`foobar-achievement-${achievement}`}
		>
			<span aria-hidden="true" className="font-mono text-primary">
				✓
			</span>
			<div>
				<h3 className="font-serif text-lg font-semibold text-primary">
					{FOOBAR_ACHIEVEMENTS[achievement].title}
				</h3>
				<p className="mt-1 text-sm text-foreground/70">
					{FOOBAR_ACHIEVEMENTS[achievement].completion.note}
				</p>
			</div>
		</article>
	</li>
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
		<li className="border-b border-foreground/20">
			<article className="scroll-mt-24" id={`foobar-achievement-${achievement}`}>
				<div className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-start gap-2 py-4">
					<span aria-hidden="true" className="pt-0.5 font-mono text-foreground/45">
						○
					</span>
					<div className="min-w-0">
						<h3 className="font-serif text-lg font-semibold break-words">{metadata.title}</h3>
						<p className="mt-1 text-sm text-foreground/65">{FOOBAR_TEASERS[achievement]}</p>
					</div>
					<button
						aria-controls={`foobar-achievement-details-${achievement}`}
						aria-expanded={isExpanded}
						aria-label={`${isExpanded ? "Close" : "Open"} field entry for ${metadata.title}`}
						className="inline-flex min-h-11 min-w-11 items-start justify-center link-base pt-0.5 font-mono text-lg text-primary"
						id={`foobar-achievement-trigger-${achievement}`}
						onClick={onToggle}
						type="button"
					>
						<span aria-hidden="true">{isExpanded ? "−" : "+"}</span>
					</button>
				</div>

				{isExpanded ? (
					<div className="mr-4 pb-5 pl-[2.05rem]" id={`foobar-achievement-details-${achievement}`}>
						{revealedHints.length > 0 ? (
							<ol className="grid gap-3 text-sm text-foreground/80">
								{revealedHints.map(({ hint, number }) => (
									<li className="grid grid-cols-[auto_minmax(0,1fr)] gap-2" key={hint.id}>
										<span aria-hidden="true" className="font-mono text-primary">
											→
										</span>
										<span className="break-words">
											<span className="sr-only">Hint {number}: </span>
											<span>{hint.text}</span>
										</span>
									</li>
								))}
							</ol>
						) : (
							<p className="text-sm text-foreground/65">Nothing written down yet.</p>
						)}

						{recordedHint !== null ? (
							<p className="mt-4 text-sm text-foreground/70" role="status">
								Hint {recordedHint} remembered.{" "}
								<a
									className="font-medium text-primary underline underline-offset-4"
									href="#foobar-field-notes"
								>
									See all notes
								</a>
								.
							</p>
						) : null}

						{nextHint && nextHintNumber <= 3 ? (
							<button
								aria-label={`Reveal hint ${nextHintNumber} of 4 for ${metadata.title}`}
								className="mt-3 inline-flex min-h-11 items-center link-base font-mono text-xs text-primary"
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
		</li>
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
