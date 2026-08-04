"use client";

/**
 * Client-side dashboard and access gate for the /foobar game. The page behaves
 * like a 404 until the hidden entry point flips persisted state, then records
 * any visited achievement slug as completed and renders the progress dashboard.
 */
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { IS_DEV } from "@/config";
import { NotFound404 } from "@/lib/components/Error";
import { Code } from "@/lib/components/Typography";
import { ShowCompletedBadges } from "@/lib/domains/foobar/badges";
import { isFoobarAchievement, type FoobarAchievement } from "@/lib/domains/foobar/catalog";
import { CloudProgressPanel } from "@/lib/domains/foobar/CloudProgressPanel";
import { FieldNotes } from "@/lib/domains/foobar/FieldNotes";
import { FOOBAR_FLAGS } from "@/lib/domains/foobar/flags";
import { useSharedHunterPresence } from "@/lib/domains/foobar/sharedHunterPresence";
import { type FoobarSchrodingerProps, initialFoobarData } from "@/lib/domains/foobar/store";
import { useGlobalStore } from "@/lib/domains/global";
import { useCustomPlausible } from "@/lib/domains/Plausible";
import { useHasMounted } from "@/lib/helpers/hooks";

export const FoobarDashboard = () => {
	// const router = useRouter();
	const navigate = useNavigate();
	const plausibleEvent = useCustomPlausible();
	const { foobar_data, setFoobarData } = useGlobalStore(
		useShallow((state) => ({
			foobar_data: state.foobar_data,
			setFoobarData: state.setFoobarData,
		})),
	);
	const [activeAchievement, setActiveAchievement] = useState<FoobarAchievement>();
	useEffect(() => {
		function handleUserIsOffline() {
			navigate({ to: "/foobar/$slug", params: { slug: "offline" } });
		}

		window.addEventListener("offline", handleUserIsOffline);

		return () => {
			window.removeEventListener("offline", handleUserIsOffline);
		};
	}, [navigate]);

	function handleClearFoobarData() {
		plausibleEvent("foobar", { props: { achievement: "restart" } });
		// Local reset only: signed-in players delete their cloud save separately
		// from the Hunter registry, so a stray restart cannot erase remote progress.
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

		// eslint-disable-next-line no-console
		console.log("cleared");
	}

	function handleSelectAchievement(achievement: FoobarAchievement) {
		setActiveAchievement(achievement);
		window.requestAnimationFrame(() => {
			const target = document.getElementById(`foobar-achievement-${achievement}`);
			target?.scrollIntoView({ behavior: "smooth", block: "center" });
			// Every entry has a trigger after completion; focusing it keeps
			// keyboard users on a visible, operable control.
			document.getElementById(`foobar-achievement-trigger-${achievement}`)?.focus();
		});
	}

	return (
		<div className="pb-16">
			{IS_DEV && (
				<details className="mt-5 rounded-global border border-foreground/15 bg-foreground/5 p-3 font-mono text-xs dark:bg-foreground/10">
					<summary className="flex min-h-11 cursor-pointer items-center font-semibold">
						DEV progress data
					</summary>
					<pre className="mt-3 overflow-x-auto border-t border-foreground/15 pt-3">
						{JSON.stringify(foobar_data, null, 2)}
					</pre>
				</details>
			)}
			<h1 className="pt-12 font-serif text-6xl leading-none font-bold sm:pt-20 sm:text-7xl">
				/foobar
			</h1>
			<ShowCompletedBadges
				completed={foobar_data.completed}
				all_achievements={foobar_data.all_achievements}
				clues_seen={foobar_data.clues_seen}
				activeAchievement={activeAchievement}
				onSelectAchievement={handleSelectAchievement}
				onCollapseAchievement={() => setActiveAchievement(undefined)}
			/>
			<FieldNotes
				clues_seen={foobar_data.clues_seen}
				onSelectAchievement={handleSelectAchievement}
			/>
			<Basecamp handleClearFoobarData={handleClearFoobarData} />
			<p aria-hidden="true" data-foobar-print-clue>
				The paper remembers a path the screen will not: /foobar/print-preview
			</p>
			{/* <Center>
				<SupportSreetamDas />
			</Center> */}
			{/* <Terminal {...{ visible: terminalVisible, toggleTerminal }} /> */}
			{/* {!terminalVisible && <KonamiWrapper />} */}
			<XMarksTheSpot foobar="/foobar/devtools" />
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
		<section
			aria-labelledby="foobar-campfire-status"
			className="border-t border-foreground/15 pt-5"
		>
			<h3 id="foobar-campfire-status" className="font-serif text-xl leading-normal">
				Campfire
			</h3>
			<p className="mt-2 text-sm text-foreground/70" aria-live="polite">
				{connected
					? `${count} ${count === 1 ? "hunter" : "hunters"} online. ${count > 1 ? "The fire is lively." : "There is room beside the fire."}`
					: "Listening for other hunters…"}
			</p>
		</section>
	);
};

const Basecamp = ({ handleClearFoobarData }: { handleClearFoobarData: () => void }) => (
	<section aria-labelledby="foobar-basecamp" className="mt-20 border-t border-foreground/25 pt-8">
		<h2 id="foobar-basecamp" className="font-serif text-3xl font-bold">
			Basecamp
		</h2>
		<p className="mt-2 text-sm text-foreground/70">
			The practical stuff: other visitors, saved progress, stats, and the big reset button.
		</p>
		<details className="group mt-4">
			<summary className="flex min-h-11 cursor-pointer list-none items-center link-base font-medium text-primary marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
				<span aria-hidden="true" className="mr-2 group-open:hidden">
					→
				</span>
				<span aria-hidden="true" className="mr-2 hidden group-open:inline">
					↓
				</span>
				<span className="group-open:hidden">Open Basecamp</span>
				<span className="hidden group-open:inline">Close Basecamp</span>
			</summary>
			<div className="mt-3 grid gap-5">
				<CampfireStatus />
				<CloudProgressPanel />
				<div className="border-t border-foreground/15 pt-5">
					<h3 className="font-serif text-xl">Logbook</h3>
					<Link
						to="/stats"
						search={{ period: "30d" }}
						className="mt-2 inline-flex min-h-11 items-center link-base text-sm text-primary"
					>
						<span aria-hidden="true" className="mr-2">
							→
						</span>
						View public site stats
					</Link>
				</div>
				<details className="border-t border-foreground/15 pt-5">
					<summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-foreground/70">
						Manage progress
					</summary>
					<p className="mb-3 text-xs leading-relaxed text-foreground/60">
						Reset only this browser. Cloud progress is managed separately in the Hunter registry.
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
					className="inline-flex min-h-11 items-center rounded-global border border-red-300 bg-background px-4 py-2 text-sm text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
					type="button"
				/>
			}
		>
			Clear everything and restart
		</AlertDialog.Trigger>
		<AlertDialog.Portal>
			<AlertDialog.Backdrop className="fixed inset-0 bg-slate-950/40 data-open:animate-overlayShow" />
			<AlertDialog.Popup className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-global bg-white p-[25px] shadow-[hsl(206_22%_7%/35%)_0px_10px_38px_-10px,hsl(206_22%_7%/20%)_0px_10px_20px_-15px] focus:outline-none data-open:animate-contentShow">
				<AlertDialog.Title className="m-0 text-[17px] font-medium text-slate-950">
					Are you absolutely sure?
				</AlertDialog.Title>
				<AlertDialog.Description className="mt-4 mb-5 text-[15px] leading-normal text-zinc-500">
					This action cannot be undone.
					<br />
					This will reset your <Code>/foobar</Code> progress in this browser. A cloud save is not
					deleted here — it will restore your progress on the next sync unless you delete it from
					the Hunter registry.
				</AlertDialog.Description>
				<div className="flex flex-wrap justify-end gap-3">
					<AlertDialog.Close
						render={
							<button
								className="inline-flex min-h-11 items-center justify-center rounded-global bg-zinc-100 px-4 py-2 leading-none font-medium text-zinc-600 outline-none hover:bg-zinc-200 focus:shadow-[0_0_0_2px] focus:shadow-zinc-300"
								type="button"
							/>
						}
					>
						Cancel
					</AlertDialog.Close>
					<AlertDialog.Close
						render={
							<button
								className="inline-flex min-h-11 items-center justify-center rounded-global bg-red-100 px-4 py-2 leading-none font-medium text-red-700 outline-none hover:bg-red-200 focus:shadow-[0_0_0_2px] focus:shadow-red-300"
								onClick={handleClearFoobarData}
								type="button"
							/>
						}
					>
						Yes, reset progress
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
	const plausibleEvent = useCustomPlausible();

	useEffect(() => {
		if (completed_page) {
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
				plausibleEvent("foobar", { props: { achievement: completed_flag } });
				completeFoobarFlag(completed_flag);
			}
		}
	}, [completeFoobarFlag, completed, completed_page, plausibleEvent]);

	if (!has_mounted) return null;
	if (!unlocked) return <FoobarButLocked />;

	return <FoobarDashboard />;
};
