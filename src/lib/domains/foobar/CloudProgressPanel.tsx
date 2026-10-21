"use client";

/**
 * Optional account-backed Foobar save UI. Anonymous localStorage remains the
 * default; after sign-in the browser and D1 copies are merged before background
 * sync begins, so neither device can overwrite discoveries from the other.
 */
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTrackEvent } from "@/lib/domains/Analytics";
import { useGlobalStore } from "@/lib/domains/global";
import { captureException } from "@/lib/domains/Sentry";

import { mergeFoobarProgress } from "./cloud-progress";
import {
	enableFoobarProgressServerFn,
	fetchFoobarBootstrapServerFn,
	resetFoobarProgressServerFn,
	setFoobarPublicProfileServerFn,
	syncFoobarProgressServerFn,
	type FoobarBootstrap,
	type FoobarSignInProvider,
} from "./cloud-progress.server";
import { foobarCloudFailureLabel, type FoobarCloudFailedOperation } from "./cloud-sync-errors";
import { publishFoobarCloudLifecycle, subscribeFoobarCloudLifecycle } from "./cloud-sync-lifecycle";
import { createFoobarCloudSyncSession } from "./cloud-sync-session";
import { type FoobarDataType } from "./store";

type SyncState = "loading" | "local" | "saving" | "saved" | "deleting" | "disabled" | "error";

const SIGN_IN_LABELS: Record<FoobarSignInProvider, string> = {
	github: "Sign in with GitHub",
};

// Discoveries made while a save was in flight are missing from the server's
// reply; merging keeps them, and lastSynced (the server copy) then differs from
// local state, so the debounce sends them in a follow-up save.
function withLatestLocalProgress(synced: FoobarDataType): FoobarDataType {
	return mergeFoobarProgress(useGlobalStore.getState().foobar_data, synced);
}

export function CloudProgressPanel() {
	const { foobarData, setFoobarData, hasHydrated } = useGlobalStore(
		useShallow((state) => ({
			foobarData: state.foobar_data,
			setFoobarData: state.setFoobarData,
			hasHydrated: state._hasHydrated,
		})),
	);
	const [bootstrap, setBootstrap] = useState<FoobarBootstrap | null>(null);
	const [syncState, setSyncState] = useState<SyncState>("loading");
	const [failedOperation, setFailedOperation] = useState<FoobarCloudFailedOperation | null>(null);
	const [failedProfileValue, setFailedProfileValue] = useState(false);
	const [reloadKey, setReloadKey] = useState(0);
	const lastSynced = useRef("");
	const syncSession = useRef(createFoobarCloudSyncSession());
	const trackEvent = useTrackEvent();

	useEffect(
		() =>
			subscribeFoobarCloudLifecycle((lifecycle) => {
				syncSession.current.invalidate();
				if (lifecycle === "disabled") {
					lastSynced.current = JSON.stringify(useGlobalStore.getState().foobar_data);
					setBootstrap((value) =>
						value ? { ...value, cloud: null, cloudSyncEnabled: false } : value,
					);
					setFailedOperation(null);
					setSyncState("disabled");
					return;
				}

				setSyncState("loading");
				setReloadKey((value) => value + 1);
			}),
		[],
	);

	useEffect(() => {
		if (!hasHydrated) return;
		let active = true;

		void fetchFoobarBootstrapServerFn()
			.then(async (result) => {
				if (!active) return;
				setFailedOperation(null);
				setBootstrap(result);
				if (!result.user) {
					setSyncState("local");
					return;
				}
				if (result.cloudSyncEnabled === null) {
					setFailedOperation("load");
					setSyncState("error");
					return;
				}

				const current = useGlobalStore.getState().foobar_data;
				if (!result.cloudSyncEnabled) {
					lastSynced.current = JSON.stringify(current);
					setSyncState("disabled");
					return;
				}

				const merged = mergeFoobarProgress(current, result.cloud?.progress);
				const serialized = JSON.stringify(merged);
				lastSynced.current = serialized;
				setFoobarData(merged);

				if (result.cloud && serialized === JSON.stringify(result.cloud.progress)) {
					setSyncState("saved");
					return;
				}

				// No stored row yet (first sign-in) or the merge learned something new:
				// sync now so the D1 copy exists and matches the browser.
				setSyncState("saving");
				const token = syncSession.current.begin();
				let synced: Awaited<ReturnType<typeof syncFoobarProgressServerFn>>;
				try {
					synced = await syncFoobarProgressServerFn({ data: { progress: merged } });
				} catch (error) {
					if (active && syncSession.current.isCurrent(token)) {
						captureException(error);
						setFailedOperation("sync");
						setSyncState("error");
					}
					return;
				}
				if (!active || !syncSession.current.isCurrent(token)) return;
				lastSynced.current = JSON.stringify(synced.cloud.progress);
				setFoobarData(withLatestLocalProgress(synced.cloud.progress));
				setBootstrap((value) =>
					value ? { ...value, cloud: synced.cloud, community: synced.community } : value,
				);
				setSyncState("saved");
			})
			.catch((error: unknown) => {
				if (active) {
					captureException(error);
					setFailedOperation("load");
					setSyncState("error");
				}
			});

		return () => {
			active = false;
		};
	}, [hasHydrated, reloadKey, setFoobarData]);

	useEffect(() => {
		if (!bootstrap?.user || !bootstrap.cloudSyncEnabled || !bootstrap.cloud) return;
		const serialized = JSON.stringify(foobarData);
		if (serialized === lastSynced.current) return;

		const timeout = setTimeout(() => {
			setSyncState("saving");
			const token = syncSession.current.begin();
			void syncFoobarProgressServerFn({ data: { progress: foobarData } })
				.then((synced) => {
					if (!syncSession.current.isCurrent(token)) return;
					lastSynced.current = JSON.stringify(synced.cloud.progress);
					setFoobarData(withLatestLocalProgress(synced.cloud.progress));
					setBootstrap((value) =>
						value ? { ...value, cloud: synced.cloud, community: synced.community } : value,
					);
					setSyncState("saved");
				})
				.catch((error: unknown) => {
					if (syncSession.current.isCurrent(token)) {
						captureException(error);
						setFailedOperation("sync");
						setSyncState("error");
					}
				});
		}, 700);

		return () => clearTimeout(timeout);
	}, [bootstrap?.cloud, bootstrap?.cloudSyncEnabled, bootstrap?.user, foobarData, setFoobarData]);

	async function handlePublicProfile(publicProfile: boolean) {
		setFailedOperation(null);
		setBootstrap((value) =>
			value?.cloud ? { ...value, cloud: { ...value.cloud, publicProfile } } : value,
		);
		try {
			await setFoobarPublicProfileServerFn({ data: { publicProfile } });
			setSyncState("saved");
		} catch (error) {
			captureException(error);
			setBootstrap((value) =>
				value?.cloud
					? { ...value, cloud: { ...value.cloud, publicProfile: !publicProfile } }
					: value,
			);
			setFailedProfileValue(publicProfile);
			setFailedOperation("profile");
			setSyncState("error");
		}
	}

	async function handleCloudReset() {
		setFailedOperation(null);
		syncSession.current.invalidate();
		setSyncState("deleting");
		setBootstrap((value) => (value ? { ...value, cloud: null, cloudSyncEnabled: false } : value));
		try {
			await resetFoobarProgressServerFn();
			lastSynced.current = JSON.stringify(useGlobalStore.getState().foobar_data);
			publishFoobarCloudLifecycle("disabled");
			trackEvent("foobar_cloud_lifecycle", { props: { operation: "disabled" } });
			setSyncState("disabled");
		} catch (error) {
			captureException(error);
			setFailedOperation("delete");
			setSyncState("error");
		}
	}

	async function handleCloudEnable() {
		setFailedOperation(null);
		setSyncState("saving");
		const progress = useGlobalStore.getState().foobar_data;
		const token = syncSession.current.begin();
		try {
			const synced = await enableFoobarProgressServerFn({ data: { progress } });
			if (!syncSession.current.isCurrent(token)) return;
			lastSynced.current = JSON.stringify(synced.cloud.progress);
			setFoobarData(withLatestLocalProgress(synced.cloud.progress));
			setBootstrap((value) =>
				value
					? {
							...value,
							cloud: synced.cloud,
							cloudSyncEnabled: true,
							community: synced.community,
						}
					: value,
			);
			publishFoobarCloudLifecycle("enabled");
			trackEvent("foobar_cloud_lifecycle", { props: { operation: "enabled" } });
			setSyncState("saved");
		} catch (error) {
			if (syncSession.current.isCurrent(token)) {
				captureException(error);
				setFailedOperation("enable");
				setSyncState("error");
			}
		}
	}

	async function handleSignOut() {
		setFailedOperation(null);
		syncSession.current.invalidate();
		try {
			const response = await fetch("/api/auth/sign-out", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: "{}",
			});
			if (!response.ok) throw new Error(`Foobar sign-out failed with ${response.status}`);
			publishFoobarCloudLifecycle("signed-out");
			setSyncState("loading");
			setReloadKey((value) => value + 1);
		} catch (error) {
			captureException(error);
			setFailedOperation("signOut");
			setSyncState("error");
		}
	}

	function retryFailedOperation() {
		if (failedOperation === "delete") return void handleCloudReset();
		if (failedOperation === "signOut") return void handleSignOut();
		if (failedOperation === "enable") return void handleCloudEnable();
		if (failedOperation === "profile") return void handlePublicProfile(failedProfileValue);
		setSyncState("loading");
		setReloadKey((value) => value + 1);
	}

	const community = bootstrap?.community ?? { finisherCount: 0, leaderboard: [] };

	return (
		<section aria-labelledby="foobar-cloud-title" className="border-t border-foreground/15 pt-5">
			<div className="flex flex-wrap items-baseline justify-between gap-2">
				<h3 id="foobar-cloud-title" className="font-serif text-xl leading-normal">
					Cloud save
				</h3>
				<p className="font-mono text-xs text-foreground/55">
					{community.finisherCount} {community.finisherCount === 1 ? "finisher" : "finishers"}
				</p>
			</div>
			{failedOperation ? (
				<div className="mt-3 flex flex-wrap items-center gap-2 text-sm" role="alert">
					<span>{foobarCloudFailureLabel(failedOperation)}</span>
					<button
						className="inline-flex min-h-11 items-center rounded-global border border-foreground/25 px-3 py-2 font-medium"
						onClick={retryFailedOperation}
						type="button"
					>
						Retry
					</button>
				</div>
			) : null}

			{bootstrap?.user ? (
				<div className="mt-3 space-y-3 text-sm">
					<div className="flex flex-wrap items-center gap-x-3">
						<p>
							Signed in as <strong>{bootstrap.user.name}</strong>. {syncLabel(syncState)}
						</p>
						<button
							className="inline-flex min-h-11 items-center link-base text-primary"
							onClick={() => void handleSignOut()}
							type="button"
						>
							Sign out
						</button>
					</div>
					{bootstrap.cloud?.progress.all_achievements && bootstrap.cloud.completedAt !== null ? (
						<label className="flex min-h-11 max-w-md items-start gap-2 py-2 text-foreground/75">
							<input
								checked={bootstrap.cloud.publicProfile}
								className="mt-1"
								onChange={(event) => void handlePublicProfile(event.currentTarget.checked)}
								type="checkbox"
							/>
							<span>Add my name and finish date to the public Finishers list.</span>
						</label>
					) : null}
					{bootstrap.cloud?.certificateId ? (
						<a
							className="inline-flex font-medium text-secondary underline decoration-secondary/40 underline-offset-4"
							href={`/foobar/certificate/${bootstrap.cloud.certificateId}`}
						>
							Open completion certificate
						</a>
					) : null}
					{bootstrap.cloud ? (
						<CloudResetDialog onReset={() => void handleCloudReset()} />
					) : bootstrap.cloudSyncEnabled === false ? (
						<button
							className="inline-flex min-h-11 items-center rounded-global border border-foreground/25 px-3 py-2"
							disabled={syncState === "saving"}
							onClick={() => void handleCloudEnable()}
							type="button"
						>
							Save this browser's progress to cloud
						</button>
					) : null}
				</div>
			) : (
				<div className="mt-3 text-sm">
					<p className="text-foreground/75">
						Your progress stays in this browser.{" "}
						{bootstrap === null
							? null
							: bootstrap.signInProviders.length > 0
								? "Sign in to save progress across devices."
								: "Cloud save isn't available right now."}
					</p>
					{bootstrap && bootstrap.signInProviders.length > 0 ? (
						<div className="mt-3 flex flex-wrap gap-2">
							{bootstrap.signInProviders.map((provider) => (
								<a
									className="inline-flex min-h-11 items-center rounded-global border border-foreground/25 px-3 py-2"
									href={`/api/login/${provider}?returnTo=/foobar`}
									key={provider}
								>
									{SIGN_IN_LABELS[provider]}
								</a>
							))}
						</div>
					) : null}
				</div>
			)}

			{community.leaderboard.length > 0 ? (
				<div className="mt-5">
					<h4 id="foobar-finishers-title" className="font-mono text-xs text-foreground/60">
						Finishers
					</h4>
					<ul aria-labelledby="foobar-finishers-title" className="mt-2 space-y-1 text-sm">
						{community.leaderboard.map((entry) => (
							<li className="flex max-w-md justify-between gap-4" key={entry.certificateId}>
								<span>{entry.name}</span>
								<time dateTime={new Date(entry.completedAt).toISOString()}>
									{new Date(entry.completedAt).toLocaleDateString()}
								</time>
							</li>
						))}
					</ul>
				</div>
			) : null}
		</section>
	);
}

function syncLabel(state: SyncState): string {
	if (state === "loading") return "Checking cloud save…";
	if (state === "saving") return "Saving…";
	if (state === "deleting") return "Deleting cloud save…";
	if (state === "disabled") return "Cloud saving is off. Progress stays in this browser.";
	if (state === "error") return "Cloud save needs another try.";
	if (state === "local") return "Progress stays in this browser.";
	return "Progress saved.";
}

function CloudResetDialog({ onReset }: { onReset: () => void }) {
	return (
		<AlertDialog.Root>
			<AlertDialog.Trigger
				render={
					<button
						aria-label="Delete cloud save"
						className="inline-flex min-h-11 items-center rounded-global border border-foreground/25 px-3 py-2 text-foreground/75 hover:border-red-300 hover:text-red-700 dark:hover:border-red-400/60 dark:hover:text-red-300"
						type="button"
					/>
				}
			>
				Delete cloud save
			</AlertDialog.Trigger>
			<AlertDialog.Portal>
				<AlertDialog.Backdrop className="fixed inset-0 z-30 bg-slate-950/40 data-open:animate-overlayShow" />
				<AlertDialog.Popup className="fixed top-1/2 left-1/2 z-40 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-global border border-foreground/15 bg-background p-6 text-foreground shadow-lg focus:outline-none data-open:animate-contentShow">
					<AlertDialog.Title className="text-lg font-medium">
						Delete your cloud save?
					</AlertDialog.Title>
					<AlertDialog.Description className="mt-3 text-sm leading-normal text-foreground/70">
						Your progress will remain in this browser. Your certificate link stops working and you
						leave the Finishers list. Cloud saving stays off until you explicitly enable it again.
					</AlertDialog.Description>
					<div className="mt-5 flex justify-end gap-3">
						<AlertDialog.Close
							render={
								<button
									aria-label="Keep cloud save"
									className="inline-flex min-h-11 items-center rounded-global bg-foreground/10 px-3 py-2 text-sm"
									type="button"
								/>
							}
						>
							Keep cloud save
						</AlertDialog.Close>
						<AlertDialog.Close
							render={
								<button
									aria-label="Yes, delete cloud save"
									className="inline-flex min-h-11 items-center rounded-global bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-950/60 dark:text-red-300 dark:hover:bg-red-900/60"
									onClick={onReset}
									type="button"
								/>
							}
						>
							Yes, delete cloud save
						</AlertDialog.Close>
					</div>
				</AlertDialog.Popup>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
}
