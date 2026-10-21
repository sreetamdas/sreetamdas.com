"use client";

/**
 * Field notes as the tail of a log file: the latest hints and finds, newest
 * first, plus a "word" line for every finished puzzle tier. Five lines by
 * default; the rest stay one click away.
 */
import { useState } from "react";

import { Bracketed } from "./Bracketed";
import {
	FOOBAR_ACHIEVEMENTS,
	FOOBAR_PUZZLE_TIER_WORDS,
	FOOBAR_REQUIRED_ACHIEVEMENTS,
	FOOBAR_TIERS,
	getFoobarClue,
	hasFinishedFoobarTier,
	type FoobarAchievement,
	type FoobarClue,
	type FoobarPuzzleTier,
} from "./catalog";
import { FOOBAR_GLOW_CLASS, FOOBAR_TIER_TEXT_CLASS } from "./karma";
import { type FoobarDataType } from "./store";

const TAIL_LENGTH = 5;

type FieldNotesProps = Pick<FoobarDataType, "clues_seen" | "completed"> & {
	onSelectAchievement: (achievement: FoobarAchievement) => void;
};

type LogLine =
	| { kind: "clue"; clue: FoobarClue; seen_at: number | null }
	| { kind: "word"; tier: FoobarPuzzleTier; seen_at: number | null };

function tierFinishedAt(
	tier: FoobarPuzzleTier,
	clues_seen: FoobarDataType["clues_seen"],
): number | null {
	const times = FOOBAR_REQUIRED_ACHIEVEMENTS.filter(
		(achievement) => FOOBAR_ACHIEVEMENTS[achievement].tier === tier,
	).map(
		(achievement) =>
			clues_seen.find(({ id }) => id === FOOBAR_ACHIEVEMENTS[achievement].completion.id)?.seen_at ??
			null,
	);
	return times.some((time) => time === null)
		? null
		: Math.max(...times.filter((time) => time !== null));
}

export const FieldNotes = ({ clues_seen, completed, onSelectAchievement }: FieldNotesProps) => {
	const [showAll, setShowAll] = useState(false);
	const lines: Array<LogLine> = [
		...clues_seen.flatMap((entry): Array<LogLine> => {
			const clue = getFoobarClue(entry.id);
			return clue ? [{ kind: "clue", clue, seen_at: entry.seen_at }] : [];
		}),
		...Object.keys(FOOBAR_PUZZLE_TIER_WORDS)
			.filter((tier): tier is FoobarPuzzleTier => Object.hasOwn(FOOBAR_PUZZLE_TIER_WORDS, tier))
			.filter((tier) => hasFinishedFoobarTier(tier, completed))
			.map((tier): LogLine => ({ kind: "word", tier, seen_at: tierFinishedAt(tier, clues_seen) })),
	].toSorted((left, right) => {
		if (left.seen_at === null) return right.seen_at === null ? 0 : 1;
		if (right.seen_at === null) return -1;
		if (left.seen_at === right.seen_at) return left.kind === "word" ? -1 : 1;
		return right.seen_at - left.seen_at;
	});
	const visible = showAll ? lines : lines.slice(0, TAIL_LENGTH);

	return (
		<section
			aria-labelledby="foobar-field-notes-title"
			className="mt-14 scroll-mt-24"
			id="foobar-field-notes"
		>
			<h2 className="font-mono text-base font-bold text-foreground" id="foobar-field-notes-title">
				Field notes
			</h2>
			<p className="mt-1">A running record of the hints you opened and the things you found.</p>
			<div className="mt-3 border border-karma-rule bg-karma-line/50 px-3 py-2 text-[0.8125rem]">
				<p aria-hidden="true" className="text-karma-comment">
					{showAll ? "$ cat foobar.log" : `$ tail -n ${TAIL_LENGTH} foobar.log`}
				</p>
				{lines.length === 0 ? (
					<p className="text-karma-comment">
						Nothing here yet. Revealed hints and completed oddities will turn up here.
					</p>
				) : (
					<ol id="foobar-field-notes-list">
						{visible.map((line) => (
							<li key={line.kind === "word" ? `word:${line.tier}` : line.clue.id}>
								{line.kind === "word" ? (
									<p className="grid grid-cols-[auto_auto_minmax(0,1fr)] gap-x-[1ch] py-1">
										<LogTime seen_at={line.seen_at} />
										<span className="text-karma-comment">word </span>
										<span className={`${FOOBAR_TIER_TEXT_CLASS[line.tier]} ${FOOBAR_GLOW_CLASS}`}>
											{FOOBAR_TIERS[line.tier].label} finished. It left "
											{FOOBAR_PUZZLE_TIER_WORDS[line.tier]}".
										</span>
									</p>
								) : (
									<button
										aria-label={`Open ${FOOBAR_ACHIEVEMENTS[line.clue.achievement].title} from Field Notes`}
										className="group grid min-h-11 w-full grid-cols-[auto_auto_minmax(0,1fr)] items-start gap-x-[1ch] py-1 text-left focus-visible:outline-2 focus-visible:outline-karma-yellow"
										onClick={() => onSelectAchievement(line.clue.achievement)}
										type="button"
									>
										<LogTime seen_at={line.seen_at} />
										<span className="text-karma-comment">
											{line.clue.kind === "hint" ? "hint " : "found"}
										</span>
										<span className="min-w-0 break-words">
											<strong
												className={`font-normal group-hover:[text-shadow:0_0_6px_currentColor] ${
													line.clue.kind === "hint"
														? "text-foreground"
														: FOOBAR_TIER_TEXT_CLASS[
																FOOBAR_ACHIEVEMENTS[line.clue.achievement].tier
															]
												}`}
											>
												{FOOBAR_ACHIEVEMENTS[line.clue.achievement].title}
											</strong>{" "}
											<span>{line.clue.text}</span>
										</span>
									</button>
								)}
							</li>
						))}
					</ol>
				)}
			</div>
			{lines.length > TAIL_LENGTH ? (
				<button
					aria-expanded={showAll}
					aria-controls="foobar-field-notes-list"
					className="mt-2 inline-flex min-h-11 items-center text-karma-green hover:[text-shadow:0_0_6px_currentColor] focus-visible:outline-2 focus-visible:outline-karma-yellow"
					onClick={() => setShowAll((value) => !value)}
					type="button"
				>
					<Bracketed>
						{showAll ? `show latest ${TAIL_LENGTH}` : `show all ${lines.length}`}
					</Bracketed>
				</button>
			) : null}
		</section>
	);
};

function LogTime({ seen_at }: { seen_at: number | null }) {
	if (seen_at === null) return <span className="text-karma-gutter">Earlier</span>;

	return (
		<time className="text-karma-gutter" dateTime={new Date(seen_at).toISOString()}>
			{new Date(seen_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
		</time>
	);
}
