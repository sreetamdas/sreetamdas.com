"use client";

/**
 * Reverse-chronological list of valid persisted Foobar clues. It stays in the
 * ordinary page flow so the log reads like part of the site, not app chrome.
 */

import { FOOBAR_ACHIEVEMENTS, getFoobarClue, type FoobarAchievement } from "./catalog";
import { type FoobarDataType } from "./store";

type FieldNotesProps = Pick<FoobarDataType, "clues_seen"> & {
	onSelectAchievement: (achievement: FoobarAchievement) => void;
};

export const FieldNotes = ({ clues_seen, onSelectAchievement }: FieldNotesProps) => {
	const notes = clues_seen
		.flatMap((entry) => {
			const clue = getFoobarClue(entry.id);
			return clue ? [{ clue, seen_at: entry.seen_at }] : [];
		})
		.sort((left, right) => {
			if (left.seen_at === null) return right.seen_at === null ? 0 : 1;
			if (right.seen_at === null) return -1;
			return right.seen_at - left.seen_at;
		});

	return (
		<section
			aria-labelledby="foobar-field-notes"
			className="mt-20 border-t border-foreground/25 pt-8"
		>
			<h2 id="foobar-field-notes" className="font-serif text-3xl font-bold">
				Field notes
			</h2>
			<p className="mt-2 text-sm text-foreground/70">The bits you chose to write down.</p>
			{notes.length === 0 ? (
				<p className="mt-3 text-sm text-foreground/70">
					Nothing here yet. Revealed hints and completed oddities will turn up here.
				</p>
			) : (
				<ol className="mt-5 border-t border-foreground/20" id="foobar-field-notes-list">
					{notes.map(({ clue, seen_at }) => (
						<li key={clue.id} className="border-b border-foreground/20 py-3">
							<div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-mono text-xs text-foreground/60">
								<span>{clue.kind === "hint" ? "hint" : "found"}</span>
								{seen_at === null ? (
									<span>Earlier</span>
								) : (
									<time dateTime={new Date(seen_at).toISOString()}>
										{new Date(seen_at).toLocaleString(undefined, {
											dateStyle: "short",
											timeStyle: "short",
										})}
									</time>
								)}
							</div>
							<button
								aria-label={`Open ${FOOBAR_ACHIEVEMENTS[clue.achievement].title} from Field Notes`}
								className="group mt-1 flex min-h-11 w-full items-start gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
								onClick={() => onSelectAchievement(clue.achievement)}
								type="button"
							>
								<span aria-hidden="true" className="text-primary">
									→
								</span>
								<span>
									<strong className="font-serif text-sm font-semibold text-foreground group-hover:text-primary">
										{FOOBAR_ACHIEVEMENTS[clue.achievement].title}
									</strong>
									<span className="mt-0.5 block text-sm break-words text-foreground/75">
										{clue.text}
									</span>
								</span>
							</button>
						</li>
					))}
				</ol>
			)}
		</section>
	);
};
