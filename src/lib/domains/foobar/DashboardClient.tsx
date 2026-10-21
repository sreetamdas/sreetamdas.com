"use client";

/**
 * Client-side dashboard and access gate for the /foobar game. The page behaves
 * like a 404 until the hidden entry point flips persisted state, then records
 * any visited achievement slug as completed and renders the progress dashboard:
 * an Advent of Code style page in the Karma palette around the ASCII mountain,
 * dark-only while it is mounted (see useFoobarKarma).
 */
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { IS_DEV } from "@/config";
import { NotFound404 } from "@/lib/components/Error";
import { Code } from "@/lib/components/Typography";
import { useTrackEvent } from "@/lib/domains/Analytics";
import { Bracketed } from "@/lib/domains/foobar/Bracketed";
import {
	FOOBAR_ACHIEVEMENT_ORDER,
	FOOBAR_ACHIEVEMENTS,
	getFoobarStars,
	hasFinishedFoobarPuzzleTiers,
	isFoobarAchievement,
	type FoobarAchievement,
} from "@/lib/domains/foobar/catalog";
import { CloudProgressPanel } from "@/lib/domains/foobar/CloudProgressPanel";
import { getFoobarRewardPath } from "@/lib/domains/foobar/codes";
import { EntryArticle } from "@/lib/domains/foobar/EntryArticle";
import { FieldNotes } from "@/lib/domains/foobar/FieldNotes";
import { FOOBAR_FLAGS } from "@/lib/domains/foobar/flags";
import { FoobarMountainArt, FoobarTierWords } from "@/lib/domains/foobar/MountainArt";
import { useSharedHunterPresence } from "@/lib/domains/foobar/sharedHunterPresence";
import { type FoobarSchrodingerProps, initialFoobarData } from "@/lib/domains/foobar/store";
import { useFoobarKarma } from "@/lib/domains/foobar/useFoobarKarma";
import { useGlobalStore } from "@/lib/domains/global";
import { useHasMounted } from "@/lib/helpers/hooks";

const LINK_CLASS =
	"inline-flex min-h-11 items-center text-karma-green hover:[text-shadow:0_0_6px_currentColor] focus-visible:outline-2 focus-visible:outline-karma-yellow";

export const FoobarDashboard = ({ notice }: { notice?: string }) => {
	useFoobarKarma();
	const trackEvent = useTrackEvent();
	const { foobar_data, setFoobarData, completeFoobarFlag, recordFoobarClue } = useGlobalStore(
		useShallow((state) => ({
			foobar_data: state.foobar_data,
			setFoobarData: state.setFoobarData,
			completeFoobarFlag: state.completeFoobarFlag,
			recordFoobarClue: state.recordFoobarClue,
		})),
	);
	const [activeAchievement, setActiveAchievement] = useState<FoobarAchievement>();
	const [cloudName, setCloudName] = useState<string | null>(null);
	useEffect(() => {
		// Awarded in place: navigating would need a route chunk the network can no longer fetch.
		function handleUserIsOffline() {
			if (useGlobalStore.getState().foobar_data.completed.includes(FOOBAR_FLAGS.offline.name)) {
				return;
			}
			trackEvent("foobar", { props: { achievement: FOOBAR_FLAGS.offline.name } });
			completeFoobarFlag(FOOBAR_FLAGS.offline.name);
		}

		window.addEventListener("offline", handleUserIsOffline);

		return () => {
			window.removeEventListener("offline", handleUserIsOffline);
		};
	}, [completeFoobarFlag, trackEvent]);

	function handleClearFoobarData() {
		trackEvent("foobar", { props: { achievement: "restart" } });
		// Local reset only: signed-in players delete their cloud save separately
		// via the Cloud save panel, so a stray restart cannot erase remote progress.
		setFoobarData(initialFoobarData);

		if ("serviceWorker" in navigator) {
			void navigator.serviceWorker
				.getRegistrations()
				.then((registrations) => {
					for (const reg of registrations) {
						const url = reg.active?.scriptURL ?? reg.installing?.scriptURL;
						if (url?.endsWith("/foobar-sw.js")) {
							void reg.unregister();
						}
					}
				})
				.catch(() => {
					// SW APIs are unavailable; reset succeeds regardless.
				});
		}
	}

	function handleSelectAchievement(achievement: FoobarAchievement) {
		setActiveAchievement(achievement);
		window.requestAnimationFrame(() => {
			const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			document.getElementById("foobar-entry")?.scrollIntoView({
				behavior: prefersReducedMotion ? "auto" : "smooth",
				block: "nearest",
			});
			// Every mountain row is a button; focusing it keeps keyboard users on
			// a visible, operable control.
			document.getElementById(`foobar-achievement-trigger-${achievement}`)?.focus();
		});
	}

	function handleToggleAchievement(achievement: FoobarAchievement) {
		if (activeAchievement === achievement) setActiveAchievement(undefined);
		else handleSelectAchievement(achievement);
	}

	const { completed, clues_seen } = foobar_data;
	const nextAchievement = FOOBAR_ACHIEVEMENT_ORDER.find(
		(achievement) => !completed.includes(achievement),
	);

	return (
		<div className="pb-16 font-mono text-sm leading-relaxed text-foreground/75 [font-variant-ligatures:none]">
			{IS_DEV && (
				<details className="mt-5 border border-karma-rule bg-karma-line/50 p-3 text-xs">
					<summary className="flex min-h-11 cursor-pointer items-center font-semibold">
						DEV progress data
					</summary>
					<pre className="mt-3 overflow-x-auto border-t border-karma-rule pt-3">
						{JSON.stringify(foobar_data, null, 2)}
					</pre>
				</details>
			)}
			<header className="pt-12 sm:pt-16">
				<div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
					<h1 className="text-4xl font-bold text-karma-green [text-shadow:0_0_2px_currentColor,0_0_12px_rgb(123_216_143/0.55)]">
						/foobar
					</h1>
					<nav aria-label="Foobar sections" className="flex flex-wrap gap-x-[1ch]">
						<a className={LINK_CLASS} href="#foobar-journal">
							<Bracketed>Journal</Bracketed>
						</a>
						<a className={LINK_CLASS} href="#foobar-field-notes">
							<Bracketed>Field notes</Bracketed>
						</a>
						<a className={LINK_CLASS} href="#foobar-basecamp">
							<Bracketed>Basecamp</Bracketed>
						</a>
					</nav>
					<p className="ml-auto text-foreground">
						{cloudName ?? "hunter"}{" "}
						<span className="text-karma-yellow [text-shadow:0_0_5px_currentColor]">
							{completed.length}*
						</span>
					</p>
				</div>
				<FoobarTierWords className="pl-[2ch]" completed={completed} />
			</header>
			<p className="mt-6 max-w-[62ch] text-pretty">
				There are strange things hiding around this website. Some are obvious. Some are decidedly
				not. This page remembers the ones you find.
			</p>
			<p className="mt-2 text-karma-comment">
				Best on a laptop. Some clues need real browser tools.
			</p>
			{notice ? (
				<output className="mt-6 block border-l-2 border-karma-yellow pl-3 text-foreground">
					{notice}
				</output>
			) : null}
			<div className="mt-6 flex flex-wrap items-center gap-x-[1ch]">
				<p>
					<strong className="font-normal text-foreground">{completed.length}</strong> of{" "}
					{FOOBAR_ACHIEVEMENT_ORDER.length} weird things found.
				</p>
				{nextAchievement ? (
					<>
						<button
							className={LINK_CLASS}
							onClick={() => handleSelectAchievement(nextAchievement)}
							type="button"
						>
							<Bracketed>Continue hunting</Bracketed>
						</button>
						<span className="text-karma-comment">
							Next: {FOOBAR_ACHIEVEMENTS[nextAchievement].title}
						</span>
					</>
				) : (
					<span className="text-karma-yellow">You found everything. Somehow.</span>
				)}
			</div>

			<section
				aria-labelledby="foobar-journal-title"
				className="mt-6 scroll-mt-24"
				id="foobar-journal"
			>
				<h2 className="sr-only" id="foobar-journal-title">
					Journal
				</h2>
				<FoobarMountainArt
					activeAchievement={activeAchievement}
					completed={completed}
					nextAchievement={nextAchievement}
					onToggleAchievement={handleToggleAchievement}
					stars={getFoobarStars(foobar_data)}
				/>
				<p className="mt-2 flex flex-wrap gap-x-4 text-xs text-karma-comment">
					<span>
						<span className="text-karma-yellow">@</span> next up
					</span>
					<span>
						<span className="text-karma-yellow">*</span> found, no hints
					</span>
					<span>
						<span className="text-karma-silver">*</span> found with hints
					</span>
				</p>
				{activeAchievement ? (
					<EntryArticle
						achievement={activeAchievement}
						clues_seen={clues_seen}
						completed={completed}
						key={activeAchievement}
						recordFoobarClue={recordFoobarClue}
					/>
				) : null}
			</section>
			<FieldNotes
				clues_seen={clues_seen}
				completed={completed}
				onSelectAchievement={handleSelectAchievement}
			/>
			<Basecamp handleClearFoobarData={handleClearFoobarData} onUserNameChange={setCloudName} />
			<p aria-hidden="true" data-foobar-print-clue>
				{`The paper remembers a path the screen will not: ${getFoobarRewardPath("print-preview")}`}
			</p>
			<XMarksTheSpot foobar={getFoobarRewardPath("devtools")} />
		</div>
	);
};

const XMarksTheSpot = ({ foobar }: { foobar: string }) => (
	<span aria-hidden="true" className="hidden" data-foobar={foobar} />
);

const CampfireStatus = () => {
	const { connected, hunters } = useSharedHunterPresence(true);
	const count = hunters ?? 0;

	return (
		<section aria-labelledby="foobar-campfire-status" className="border-t border-karma-rule pt-4">
			<h3 id="foobar-campfire-status" className="font-bold text-foreground">
				Campfire
			</h3>
			<p className="mt-1" aria-live="polite">
				{connected ? (
					<>
						<span className="text-karma-orange [text-shadow:0_0_6px_currentColor]">{count}</span>{" "}
						{count === 1 ? "hunter" : "hunters"} online.{" "}
						{count > 1 ? "The fire is lively." : "There is room beside the fire."}
					</>
				) : (
					"Listening for other hunters…"
				)}
			</p>
		</section>
	);
};

const Basecamp = ({
	handleClearFoobarData,
	onUserNameChange,
}: {
	handleClearFoobarData: () => void;
	onUserNameChange: (name: string | null) => void;
}) => (
	<section aria-labelledby="foobar-basecamp" className="mt-14 scroll-mt-24" id="foobar-basecamp">
		<h2 id="foobar-basecamp" className="text-base font-bold text-foreground">
			Basecamp
		</h2>
		<p className="mt-1">
			The practical stuff: other visitors, saved progress, stats, and the big reset button.
		</p>
		<details className="group mt-2">
			<summary className={`${LINK_CLASS} cursor-pointer list-none marker:hidden`}>
				<span aria-hidden="true">[</span>
				<span className="group-open:hidden">Open Basecamp</span>
				<span className="hidden group-open:inline">Close Basecamp</span>
				<span aria-hidden="true">]</span>
			</summary>
			<div className="mt-3 grid gap-5">
				<CampfireStatus />
				<CloudProgressPanel onUserNameChange={onUserNameChange} />
				<div className="border-t border-karma-rule pt-4">
					<h3 className="font-bold text-foreground">Logbook</h3>
					<Link className={LINK_CLASS} search={{ period: "30d" }} to="/stats">
						<Bracketed>View public site stats</Bracketed>
					</Link>
				</div>
				<details className="group/manage border-t border-karma-rule pt-4">
					<summary
						className={`${LINK_CLASS} cursor-pointer list-none text-karma-comment marker:hidden`}
					>
						<span aria-hidden="true">[</span>
						<span className="group-open/manage:hidden">Manage progress</span>
						<span className="hidden group-open/manage:inline">Hide progress tools</span>
						<span aria-hidden="true">]</span>
					</summary>
					<p className="mb-3 text-xs text-karma-comment">
						Reset only this browser. Cloud progress is managed separately in Cloud save.
					</p>
					<ResetFoobar handleClearFoobarData={handleClearFoobarData} />
				</details>
			</div>
		</details>
	</section>
);

const ResetFoobar = ({ handleClearFoobarData }: { handleClearFoobarData: () => void }) => (
	<AlertDialog.Root>
		<AlertDialog.Trigger
			render={
				<button
					aria-label="Reset this browser's progress"
					className="inline-flex min-h-11 items-center border border-karma-pink/60 px-4 py-2 text-karma-pink transition-colors hover:bg-karma-pink/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-karma-pink"
					type="button"
				/>
			}
		>
			<Bracketed>Reset this browser's progress</Bracketed>
		</AlertDialog.Trigger>
		<AlertDialog.Portal>
			<AlertDialog.Backdrop className="fixed inset-0 z-30 bg-black/60 data-open:animate-overlayShow" />
			<AlertDialog.Popup className="fixed top-[50%] left-[50%] z-40 max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] border border-karma-rule bg-karma-background p-6 font-mono text-sm text-foreground shadow-[0_10px_38px_-10px_rgb(0_0_0/0.8)] focus:outline-none data-open:animate-contentShow">
				<AlertDialog.Title className="m-0 font-bold text-karma-pink">
					--- Reset this browser's progress? ---
				</AlertDialog.Title>
				<AlertDialog.Description className="mt-4 mb-5 leading-relaxed text-foreground/75">
					Everything <Code>/foobar</Code> remembers in this browser is cleared, including the
					unlock. If you use Cloud save, your progress there is kept: unlock <Code>/foobar</Code>{" "}
					again and it comes back.
				</AlertDialog.Description>
				<div className="flex flex-wrap justify-end gap-3">
					<AlertDialog.Close
						render={
							<button aria-label="Cancel resetting progress" className={LINK_CLASS} type="button" />
						}
					>
						<Bracketed>Cancel</Bracketed>
					</AlertDialog.Close>
					<AlertDialog.Close
						render={
							<button
								aria-label="Yes, reset progress"
								className="inline-flex min-h-11 items-center border border-karma-pink/60 px-4 text-karma-pink hover:bg-karma-pink/10 focus-visible:outline-2 focus-visible:outline-karma-pink"
								onClick={handleClearFoobarData}
								type="button"
							/>
						}
					>
						<Bracketed>Yes, reset progress</Bracketed>
					</AlertDialog.Close>
				</div>
			</AlertDialog.Popup>
		</AlertDialog.Portal>
	</AlertDialog.Root>
);

const FoobarButLocked = () => (
	<NotFound404
		message={<p className="pt-5 text-center text-xs">psst, you should check the console!</p>}
	/>
);

export const FoobarSchrodinger = ({ completed_page }: FoobarSchrodingerProps) => {
	const { unlocked, completeFoobarFlag, completed } = useGlobalStore(
		useShallow((state) => ({
			unlocked: state.foobar_data.unlocked,
			completed: state.foobar_data.completed,
			completeFoobarFlag: state.completeFoobarFlag,
		})),
	);
	const has_mounted = useHasMounted();
	const trackEvent = useTrackEvent();
	const isEarlyFinalVisit =
		completed_page === FOOBAR_FLAGS.completed.slug && !hasFinishedFoobarPuzzleTiers(completed);

	useEffect(() => {
		if (unlocked && completed_page && !isEarlyFinalVisit) {
			const completed_flag = Object.values(FOOBAR_FLAGS).find((flag_props) => {
				if ("slug" in flag_props) {
					return flag_props.slug === completed_page;
				}
				return false;
			})?.name;

			if (
				completed_flag !== undefined &&
				isFoobarAchievement(completed_flag) &&
				!completed.includes(completed_flag)
			) {
				trackEvent("foobar", { props: { achievement: completed_flag } });
				completeFoobarFlag(completed_flag);
			}
		}
	}, [completeFoobarFlag, completed, completed_page, isEarlyFinalVisit, trackEvent, unlocked]);

	if (!has_mounted) return null;
	if (!unlocked) return <FoobarButLocked />;

	return (
		<FoobarDashboard
			notice={
				isEarlyFinalVisit
					? "The words are right, but the dragon isn't asleep yet. Finish every tier first."
					: undefined
			}
		/>
	);
};
