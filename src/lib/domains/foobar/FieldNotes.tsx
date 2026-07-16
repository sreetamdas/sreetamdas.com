/**
 * Chronological journal for valid persisted Foobar clues. Legacy completion
 * entries without timestamps are kept first and labelled as earlier discoveries.
 */
import { getFoobarClue } from "./catalog";
import { type FoobarDataType } from "./store";

type FieldNotesProps = Pick<FoobarDataType, "clues_seen">;

export const FieldNotes = ({ clues_seen }: FieldNotesProps) => {
	const notes = clues_seen
		.flatMap((entry) => {
			const clue = getFoobarClue(entry.id);
			return clue ? [{ clue, seen_at: entry.seen_at }] : [];
		})
		.sort((left, right) => {
			if (left.seen_at === null) return right.seen_at === null ? 0 : -1;
			if (right.seen_at === null) return 1;
			return left.seen_at - right.seen_at;
		});

	return (
		<section
			aria-labelledby="foobar-field-notes"
			className="mt-16 rounded-global border border-foreground/15 bg-foreground/5 p-5 sm:p-6 dark:bg-foreground/10"
		>
			<h2 id="foobar-field-notes" className="font-serif text-3xl leading-normal">
				Field notes
			</h2>
			{notes.length === 0 ? (
				<p className="mt-3 text-sm text-foreground/70">
					Completed discoveries and revealed hints will be recorded here.
				</p>
			) : (
				<ol className="mt-5 grid gap-4">
					{notes.map(({ clue, seen_at }) => (
						<li
							key={clue.id}
							className="min-w-0 border-t border-foreground/15 pt-4 first:border-t-0 first:pt-0"
						>
							<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 font-mono text-xs text-foreground/65">
								<span>
									{clue.kind === "hint" ? "Hint" : "Discovery"} · {clue.achievement}
								</span>
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
							<p className="mt-1 text-sm break-words text-foreground/85">{clue.text}</p>
						</li>
					))}
				</ol>
			)}
		</section>
	);
};
