"use client";

/**
 * Reverse-chronological journal for valid persisted Foobar clues. Mobile keeps
 * the log collapsible; desktop leaves it visible beside the active challenge.
 * Legacy completion entries without timestamps remain labelled as earlier.
 */
import { useState } from "react";

import { FOOBAR_ACHIEVEMENTS, getFoobarClue, type FoobarAchievement } from "./catalog";
import { type FoobarDataType } from "./store";

type FieldNotesProps = Pick<FoobarDataType, "clues_seen"> & {
	onSelectAchievement: (achievement: FoobarAchievement) => void;
};

export const FieldNotes = ({ clues_seen, onSelectAchievement }: FieldNotesProps) => {
	const [mobileNotesOpen, setMobileNotesOpen] = useState(false);
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
			className="mt-14 rounded-global border border-primary/20 bg-primary/[0.035] p-4 lg:mt-20"
		>
			<p className="font-mono text-[0.65rem] font-semibold tracking-[0.16em] text-primary uppercase">
				Your trail
			</p>
			<h2 id="foobar-field-notes" className="mt-1 font-serif text-2xl leading-normal">
				Field notes
			</h2>
			<button
				aria-controls="foobar-field-notes-list"
				aria-expanded={mobileNotesOpen}
				className="mt-3 inline-flex min-h-11 w-full items-center justify-between rounded-global border border-foreground/15 px-3 py-2 text-sm font-medium lg:hidden"
				onClick={() => setMobileNotesOpen((open) => !open)}
				type="button"
			>
				{mobileNotesOpen ? "Close notes" : `Open notes · ${notes.length}`}
				<span aria-hidden="true">{mobileNotesOpen ? "−" : "+"}</span>
			</button>
			{notes.length === 0 ? (
				<p className="mt-3 text-sm text-foreground/70">
					Completed discoveries and revealed hints will be recorded here.
				</p>
			) : (
				<ol
					className={`${mobileNotesOpen ? "grid" : "hidden"} mt-4 gap-3 lg:grid`}
					id="foobar-field-notes-list"
				>
					{notes.map(({ clue, seen_at }) => (
						<li
							key={clue.id}
							className="min-w-0 border-t border-foreground/15 pt-3 first:border-t-0 first:pt-0"
						>
							<div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-mono text-[0.68rem] text-foreground/60">
								<span>{clue.kind === "hint" ? "Field note" : "Discovery"}</span>
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
								className="mt-1 -ml-2 flex min-h-11 w-[calc(100%+0.5rem)] flex-col justify-center rounded-global px-2 text-left transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
								onClick={() => onSelectAchievement(clue.achievement)}
								type="button"
							>
								<strong className="font-serif text-sm font-semibold text-foreground">
									{FOOBAR_ACHIEVEMENTS[clue.achievement].title}
								</strong>
								<span className="mt-0.5 text-sm break-words text-foreground/75">{clue.text}</span>
							</button>
						</li>
					))}
				</ol>
			)}
		</section>
	);
};
