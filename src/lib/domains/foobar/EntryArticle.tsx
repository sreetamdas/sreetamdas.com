"use client";

/**
 * The open field entry under the mountain, written like an Advent of Code
 * puzzle page: its note or teaser, the hints already opened, the next reveal,
 * and the star it earned. Hint 4 develops for a day after hint 3 is opened.
 * Render it with `key={achievement}` so switching entries resets the
 * "Hint N remembered" acknowledgement.
 */
import { useEffect, useState } from "react";

import { useTrackEvent } from "../Analytics";
import { Bracketed } from "./Bracketed";
import {
	FOOBAR_ACHIEVEMENT_ORDER,
	FOOBAR_ACHIEVEMENTS,
	FOOBAR_TEASERS,
	getFoobarStar,
	type FoobarAchievement,
	type FoobarClueId,
} from "./catalog";
import {
	FOOBAR_HINT_DEVELOPMENT_MS,
	formatFoobarHintRemaining,
	getFoobarHintDevelopment,
	getFoobarHintElapsedBucket,
} from "./hint-development";
import { FOOBAR_GLOW_CLASS, FOOBAR_STAR_TEXT_CLASS } from "./karma";
import { type FoobarDataType } from "./store";

type EntryArticleProps = Pick<FoobarDataType, "completed" | "clues_seen"> & {
	achievement: FoobarAchievement;
	recordFoobarClue: (id: FoobarClueId) => void;
};

export function EntryArticle({
	achievement,
	completed,
	clues_seen,
	recordFoobarClue,
}: EntryArticleProps) {
	const trackEvent = useTrackEvent();
	const [recordedHint, setRecordedHint] = useState<number | null>(null);
	const metadata = FOOBAR_ACHIEVEMENTS[achievement];
	const found = completed.includes(achievement);
	const star = getFoobarStar(achievement, { completed, clues_seen });
	const number = String(FOOBAR_ACHIEVEMENT_ORDER.indexOf(achievement) + 1).padStart(2, "0");
	const clueIds = clues_seen.map(({ id }) => id);
	const revealedHints = metadata.hints.flatMap((hint, index) =>
		clueIds.includes(hint.id) ? [{ hint, number: index + 1 }] : [],
	);
	const nextHintIndex = metadata.hints.findIndex((hint) => !clueIds.includes(hint.id));
	const nextHint = found || nextHintIndex === -1 ? undefined : metadata.hints[nextHintIndex];
	const nextHintNumber = nextHintIndex + 1;
	const hint3SeenAt = clues_seen.find(({ id }) => id === metadata.hints[2]?.id)?.seen_at;
	const finalHint = metadata.hints[3];
	const foundAt = clues_seen.find(({ id }) => id === metadata.completion.id)?.seen_at;

	const revealNextHint = () => {
		if (!nextHint) return;

		recordFoobarClue(nextHint.id);
		setRecordedHint(nextHintNumber);
		if (nextHint.id === metadata.hints[2]?.id && finalHint && !clueIds.includes(finalHint.id)) {
			trackEvent("foobar_hint_development_started", {
				props: { achievement, wait_hours: FOOBAR_HINT_DEVELOPMENT_MS / (60 * 60 * 1_000) },
			});
		}
	};
	const readDevelopedHint = () => {
		if (!nextHint || hint3SeenAt === undefined) return;

		recordFoobarClue(nextHint.id);
		setRecordedHint(nextHintNumber);
		trackEvent("foobar_developed_hint_read", {
			props: { achievement, elapsed_bucket: getFoobarHintElapsedBucket(hint3SeenAt, Date.now()) },
		});
	};

	return (
		<article
			aria-labelledby="foobar-entry-title"
			className="mt-8 grid max-w-[62ch] scroll-mt-24 gap-3"
			id="foobar-entry"
		>
			<h3
				className="font-mono text-base font-bold text-foreground [text-shadow:0_0_4px_rgb(247_241_255/0.5)]"
				id="foobar-entry-title"
			>
				<span aria-hidden="true">--- No.{number}: </span>
				{metadata.title}
				<span aria-hidden="true"> ---</span>
			</h3>
			<p>
				{found ? (
					<em className="text-foreground not-italic [text-shadow:0_0_5px_rgb(247_241_255/0.6)]">
						{metadata.completion.note}
					</em>
				) : (
					FOOBAR_TEASERS[achievement]
				)}
				<EntryTags achievement={achievement} />
			</p>

			{revealedHints.length > 0 ? (
				<>
					<p>Hints you've opened:</p>
					<ol className="grid gap-2">
						{revealedHints.map(({ hint, number: hintNumber }) => (
							<li className="grid grid-cols-[auto_minmax(0,1fr)] gap-2" key={hint.id}>
								<span aria-hidden="true" className="text-karma-comment">
									-
								</span>
								<span className="break-words">
									<span className="sr-only">Hint {hintNumber}: </span>
									<span>{hint.text}</span>
								</span>
							</li>
						))}
					</ol>
				</>
			) : found ? null : (
				<p className="text-karma-comment">Nothing written down yet.</p>
			)}

			{recordedHint !== null ? (
				<output className="block">
					Hint {recordedHint} remembered.{" "}
					<a
						className="text-karma-green hover:[text-shadow:0_0_6px_currentColor]"
						href="#foobar-field-notes"
					>
						<Bracketed>see all notes</Bracketed>
					</a>
				</output>
			) : null}

			{nextHint && nextHintNumber <= 3 ? (
				<p>
					Stuck?{" "}
					<button
						aria-label={`Reveal hint ${nextHintNumber} of 4 for ${metadata.title}`}
						className="inline-flex min-h-11 items-center text-karma-green hover:[text-shadow:0_0_6px_currentColor] focus-visible:outline-2 focus-visible:outline-karma-yellow"
						onClick={revealNextHint}
						type="button"
					>
						Reveal hint {nextHintNumber} of 4
					</button>
				</p>
			) : null}
			{nextHint && nextHintNumber === 4 ? (
				<DevelopingHint
					achievement={achievement}
					hint3SeenAt={hint3SeenAt}
					onRead={readDevelopedHint}
				/>
			) : null}

			{star ? (
				<p>
					{foundAt ? `Found on ${new Date(foundAt).toLocaleDateString()}. ` : null}
					{star === "gold" ? (
						<>
							No hints needed, so it earned a{" "}
							<span className={`${FOOBAR_STAR_TEXT_CLASS.gold} ${FOOBAR_GLOW_CLASS}`}>
								gold star
							</span>
							.
						</>
					) : (
						<>
							Hints helped, so it earned a{" "}
							<span className={`${FOOBAR_STAR_TEXT_CLASS.silver} ${FOOBAR_GLOW_CLASS}`}>
								silver star
							</span>
							.
						</>
					)}
				</p>
			) : null}
		</article>
	);
}

function EntryTags({ achievement }: { achievement: FoobarAchievement }) {
	const metadata = FOOBAR_ACHIEVEMENTS[achievement];
	const labels: Array<string> = [];
	if ("optional" in metadata && metadata.optional) labels.push("bonus");
	if ("device" in metadata) labels.push(metadata.device);

	return labels.map((label) => (
		<span className="ml-2 whitespace-nowrap text-karma-orange" key={label}>
			<Bracketed>
				<span>{label}</span>
			</Bracketed>
		</span>
	));
}

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

		const timer = window.setTimeout(() => setNow(Date.now()), 0);
		return () => window.clearTimeout(timer);
	}, [hint3SeenAt]);

	useEffect(() => {
		if (hint3SeenAt === undefined || hint3SeenAt === null) return;

		const currentNow = Date.now();
		const initialDevelopment = getFoobarHintDevelopment(hint3SeenAt, currentNow);
		if (initialDevelopment.status !== "developing") return;

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
		if (development.status === "not-started") return;

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
					className="inline-flex min-h-11 items-center justify-self-start text-karma-yellow [text-shadow:0_0_5px_currentColor] focus-visible:outline-2 focus-visible:outline-karma-yellow"
					onClick={onRead}
					type="button"
				>
					<Bracketed>Read developed hint</Bracketed>
				</button>
			) : (
				<div className="border border-karma-rule bg-karma-line/60 p-4">
					<p className="text-karma-yellow">Hint 4 · Developing</p>
					<p
						aria-hidden="true"
						className="mt-2 whitespace-pre-line text-karma-rule blur-[1.5px] select-none"
					>
						{"########## ######## ####\n####### ##### ####"}
					</p>
					<p className="mt-2">
						The ink is still drying. Return in {formatFoobarHintRemaining(development.remainingMs)}.
					</p>
				</div>
			)}
		</>
	);
};
