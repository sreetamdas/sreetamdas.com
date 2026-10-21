/**
 * Renders the generated ASCII mountain (see mountain.ts) coloured by progress:
 * a found row lights up in its tier's Karma colour with a gold or silver star,
 * unfound rows stay dim, and "@" marks the next discovery to hunt. With
 * `onToggleAchievement` every row is a button that opens its field entry;
 * without it (the certificate) the picture is static.
 */
import {
	FOOBAR_ACHIEVEMENT_ORDER,
	FOOBAR_ACHIEVEMENTS,
	FOOBAR_PUZZLE_TIER_WORDS,
	FOOBAR_TIERS,
	getFoobarStar,
	hasFinishedFoobarTier,
	isFoobarPuzzleTier,
	type FoobarAchievement,
	type FoobarTier,
} from "./catalog";
import { FOOBAR_GLOW_CLASS, FOOBAR_STAR_TEXT_CLASS, FOOBAR_TIER_TEXT_CLASS } from "./karma";
import { FOOBAR_MOUNTAIN, type FoobarMountainCell } from "./mountain";
import { type FoobarDataType } from "./store";

const TIER_SHORT_LABEL: Record<FoobarTier, string> = {
	discovery: "warmup",
	browser: "browser",
	archaeology: "archaeology",
	protocol: "protocol",
	meta: "summit",
};

const ROW_GRID = "grid grid-cols-[44ch_5ch] sm:grid-cols-[44ch_5ch_16ch]";

type FoobarMountainArtProps = Pick<FoobarDataType, "completed" | "clues_seen"> & {
	nextAchievement?: FoobarAchievement;
	activeAchievement?: FoobarAchievement;
	onToggleAchievement?: (achievement: FoobarAchievement) => void;
};

export function FoobarMountainArt({
	completed,
	clues_seen,
	nextAchievement,
	activeAchievement,
	onToggleAchievement,
}: FoobarMountainArtProps) {
	const firstRowOfTier = new Map<FoobarTier, FoobarAchievement>();
	for (const { achievement } of FOOBAR_MOUNTAIN.rows) {
		const { tier } = FOOBAR_ACHIEVEMENTS[achievement];
		if (!firstRowOfTier.has(tier)) firstRowOfTier.set(tier, achievement);
	}
	const flagLit = completed.includes("completed");
	const campfireLit = completed.includes("campfire");

	return (
		<div className="overflow-x-auto pb-1 text-[clamp(9px,calc((100vw-2rem)/25),14px)] leading-[1.32] whitespace-pre [font-variant-ligatures:none]">
			<div aria-hidden="true" className={ROW_GRID}>
				<span>
					<Cells
						cells={FOOBAR_MOUNTAIN.flag}
						classFor={(cell) =>
							cell.kind === "flag"
								? flagLit
									? `text-karma-lavender ${FOOBAR_GLOW_CLASS}`
									: "text-karma-rule"
								: undefined
						}
					/>
				</span>
			</div>
			<ol aria-label="Discoveries, summit first" className="m-0 list-none p-0">
				{FOOBAR_MOUNTAIN.rows.map(({ achievement, cells }) => {
					const metadata = FOOBAR_ACHIEVEMENTS[achievement];
					const found = completed.includes(achievement);
					const star = getFoobarStar(achievement, { completed, clues_seen });
					const isNext = achievement === nextAchievement;
					const isActive = achievement === activeAchievement;
					const number = FOOBAR_ACHIEVEMENT_ORDER.indexOf(achievement) + 1;
					const tierClass = FOOBAR_TIER_TEXT_CLASS[metadata.tier];
					const content = (
						<>
							<span>
								<Cells
									cells={cells}
									classFor={(cell) => {
										if (cell.kind === "waypoint") {
											if (isNext)
												return "font-bold text-karma-yellow [text-shadow:0_0_6px_currentColor] motion-safe:animate-pulse";
											return found ? "text-foreground" : "text-karma-gutter";
										}
										if (!found) return "text-karma-rule";
										if (cell.kind === "trail") return "text-karma-comment";
										return cell.kind === "texture"
											? `${tierClass} ${FOOBAR_GLOW_CLASS}`
											: tierClass;
									}}
									waypointChar={isNext ? "@" : undefined}
								/>
							</span>
							<span>
								<span className={isActive ? "text-foreground" : "text-karma-comment"}>
									{String(number).padStart(2, " ")}
								</span>{" "}
								{star ? (
									<span className={`${FOOBAR_STAR_TEXT_CLASS[star]} ${FOOBAR_GLOW_CLASS}`}>*</span>
								) : (
									" "
								)}
							</span>
							<span className="hidden pl-[1ch] sm:inline">
								{firstRowOfTier.get(metadata.tier) === achievement ? (
									<TierLabel tier={metadata.tier} completed={completed} />
								) : null}
							</span>
						</>
					);

					return (
						<li key={achievement}>
							{onToggleAchievement ? (
								<button
									aria-controls="foobar-entry"
									aria-describedby={`foobar-row-status-${achievement}`}
									aria-expanded={isActive}
									aria-label={`${isActive ? "Close" : "Open"} field entry for ${metadata.title}`}
									className={`${ROW_GRID} w-max cursor-pointer text-left hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-karma-yellow aria-expanded:bg-foreground/10`}
									id={`foobar-achievement-trigger-${achievement}`}
									onClick={() => onToggleAchievement(achievement)}
									type="button"
								>
									{content}
									<span className="sr-only" id={`foobar-row-status-${achievement}`}>
										{`No.${number}, ${star ? `found, ${star} star` : "not found yet"}${isNext ? ", next up" : ""}`}
									</span>
								</button>
							) : (
								<div className={ROW_GRID}>{content}</div>
							)}
						</li>
					);
				})}
			</ol>
			{FOOBAR_MOUNTAIN.basecamp.map((cells, index) => (
				// oxlint-disable-next-line react/no-array-index-key -- fixed decorative rows
				<div aria-hidden="true" className={ROW_GRID} key={index}>
					<span>
						<Cells
							cells={cells}
							classFor={(cell) => {
								if (cell.kind === "fire")
									return campfireLit
										? `text-karma-orange ${FOOBAR_GLOW_CLASS} motion-safe:animate-pulse`
										: "text-karma-rule";
								if (cell.kind === "tent") return "text-foreground/70";
								return cell.kind === "ground" ? "text-karma-rule" : undefined;
							}}
						/>
					</span>
					<span />
					<span className="hidden pl-[1ch] text-karma-orange sm:inline">
						{index === 1 ? "basecamp" : null}
					</span>
				</div>
			))}
		</div>
	);
}

function TierLabel({
	tier,
	completed,
}: {
	tier: FoobarTier;
	completed: FoobarDataType["completed"];
}) {
	const tierAchievements = FOOBAR_ACHIEVEMENT_ORDER.filter(
		(achievement) => FOOBAR_ACHIEVEMENTS[achievement].tier === tier,
	);
	const found = tierAchievements.filter((achievement) => completed.includes(achievement)).length;

	if (isFoobarPuzzleTier(tier) && hasFinishedFoobarTier(tier, completed)) {
		return (
			<span
				aria-label={`${FOOBAR_TIERS[tier].label} word: ${FOOBAR_PUZZLE_TIER_WORDS[tier]}`}
				className={`${FOOBAR_TIER_TEXT_CLASS[tier]} ${FOOBAR_GLOW_CLASS}`}
				data-foobar-tier-word={tier}
			>
				{FOOBAR_PUZZLE_TIER_WORDS[tier]}
			</span>
		);
	}

	return (
		<span className="text-karma-gutter">
			{TIER_SHORT_LABEL[tier]} {found}/{tierAchievements.length}
		</span>
	);
}

function Cells({
	cells,
	classFor,
	waypointChar,
}: {
	cells: ReadonlyArray<FoobarMountainCell>;
	classFor: (cell: FoobarMountainCell) => string | undefined;
	waypointChar?: string;
}) {
	const runs: Array<{ className: string | undefined; text: string }> = [];
	for (const cell of cells) {
		const className = cell.kind === "space" ? undefined : classFor(cell);
		const char = cell.kind === "waypoint" && waypointChar ? waypointChar : cell.char;
		const last = runs.at(-1);
		if (last && last.className === className) last.text += char;
		else runs.push({ className, text: char });
	}

	return runs.map((run, index) =>
		run.className ? (
			// oxlint-disable-next-line react/no-array-index-key -- runs are positional by nature
			<span className={run.className} key={index}>
				{run.text}
			</span>
		) : (
			run.text
		),
	);
}
