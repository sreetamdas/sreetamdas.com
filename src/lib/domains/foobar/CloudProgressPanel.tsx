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

import { Bracketed } from "./Bracketed";
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

export function CloudProgressPanel({
	onUserNameChange,
}: {
	onUserNameChange?: (name: string | null) => void;
}) {
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
	const userName = bootstrap?.user?.name ?? null;
	useEffect(() => onUserNameChange?.(userName), [onUserNameChange, userName]);

	return (
		<section aria-labelledby="foobar-cloud-title" className="border-t border-karma-rule pt-4">
			<div className="flex flex-wrap items-baseline justify-between gap-2">
				<h3 id="foobar-cloud-title" className="font-bold text-foreground">
					Cloud save
				</h3>
				<p className="text-xs text-karma-comment">
					{community.finisherCount} {community.finisherCount === 1 ? "finisher" : "finishers"}
				</p>
			</div>
			{failedOperation ? (
				<div className="mt-3 flex flex-wrap items-center gap-2 text-sm" role="alert">
					<span>{foobarCloudFailureLabel(failedOperation)}</span>
					<button
						className="inline-flex min-h-11 items-center text-karma-green hover:[text-shadow:0_0_6px_currentColor] focus-visible:outline-2 focus-visible:outline-karma-yellow"
						onClick={retryFailedOperation}
						type="button"
					>
						<Bracketed>Retry</Bracketed>
					</button>
				</div>
			) : null}

			{bootstrap?.user ? (
				<div className="mt-2 space-y-2">
					<div className="flex flex-wrap items-center gap-x-3">
						<p>
							Signed in as{" "}
							<strong className="font-normal text-foreground">{bootstrap.user.name}</strong>.{" "}
							{syncLabel(syncState)}
						</p>
						<button
							className="inline-flex min-h-11 items-center text-karma-green hover:[text-shadow:0_0_6px_currentColor] focus-visible:outline-2 focus-visible:outline-karma-yellow"
							onClick={() => void handleSignOut()}
							type="button"
						>
							<Bracketed>Sign out</Bracketed>
						</button>
					</div>
					{bootstrap.cloud?.progress.all_achievements && bootstrap.cloud.completedAt !== null ? (
						<label className="flex min-h-11 max-w-md items-start gap-2 py-2">
							<input
								checked={bootstrap.cloud.publicProfile}
								className="mt-1 accent-karma-green"
								onChange={(event) => void handlePublicProfile(event.currentTarget.checked)}
								type="checkbox"
							/>
							<span>Add my name and finish date to the public Finishers list.</span>
						</label>
					) : null}
					{bootstrap.cloud?.certificateId ? (
						<a
							className="inline-flex min-h-11 items-center text-karma-yellow hover:[text-shadow:0_0_6px_currentColor] focus-visible:outline-2 focus-visible:outline-karma-yellow"
							href={`/foobar/certificate/${bootstrap.cloud.certificateId}`}
						>
							<Bracketed>Open completion certificate</Bracketed>
						</a>
					) : null}
					{bootstrap.cloud ? (
						<CloudResetDialog onReset={() => void handleCloudReset()} />
					) : bootstrap.cloudSyncEnabled === false ? (
						<button
							className="inline-flex min-h-11 items-center text-karma-green hover:[text-shadow:0_0_6px_currentColor] focus-visible:outline-2 focus-visible:outline-karma-yellow disabled:opacity-50"
							disabled={syncState === "saving"}
							onClick={() => void handleCloudEnable()}
							type="button"
						>
							<Bracketed>Save this browser's progress to cloud</Bracketed>
						</button>
					) : null}
				</div>
			) : (
				<div className="mt-2">
					<p>
						Your progress stays in this browser.{" "}
						{bootstrap === null
							? null
							: bootstrap.signInProviders.length > 0
								? "Sign in to save progress across devices."
								: "Cloud save isn't available right now."}
					</p>
					{bootstrap && bootstrap.signInProviders.length > 0 ? (
						<div className="mt-1 flex flex-wrap gap-x-[1ch]">
							{bootstrap.signInProviders.map((provider) => (
								<a
									className="inline-flex min-h-11 items-center text-karma-green hover:[text-shadow:0_0_6px_currentColor] focus-visible:outline-2 focus-visible:outline-karma-yellow"
									href={`/api/login/${provider}?returnTo=/foobar`}
									key={provider}
								>
									<Bracketed>{SIGN_IN_LABELS[provider]}</Bracketed>
								</a>
							))}
						</div>
					) : null}
				</div>
			)}

			{community.leaderboard.length > 0 ? (
				<div className="mt-5">
					<h4 id="foobar-finishers-title" className="text-xs text-karma-comment">
						Finishers
					</h4>
					<ul aria-labelledby="foobar-finishers-title" className="mt-1 space-y-0.5">
						{community.leaderboard.map((entry) => (
							<li className="flex max-w-md justify-between gap-4" key={entry.certificateId}>
								<span className="text-foreground">{entry.name}</span>
								<time
									className="text-karma-comment"
									dateTime={new Date(entry.completedAt).toISOString()}
								>
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
						className="inline-flex min-h-11 items-center border border-karma-pink/60 px-3 py-2 text-karma-pink hover:bg-karma-pink/10 focus-visible:outline-2 focus-visible:outline-karma-pink"
						type="button"
					/>
				}
			>
				<Bracketed>Delete cloud save</Bracketed>
			</AlertDialog.Trigger>
			<AlertDialog.Portal>
				<AlertDialog.Backdrop className="fixed inset-0 z-30 bg-black/60 data-open:animate-overlayShow" />
				<AlertDialog.Popup className="fixed top-1/2 left-1/2 z-40 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 border border-karma-rule bg-karma-background p-6 font-mono text-sm text-foreground shadow-[0_10px_38px_-10px_rgb(0_0_0/0.8)] focus:outline-none data-open:animate-contentShow">
					<AlertDialog.Title className="font-bold text-karma-pink">
						--- Delete your cloud save? ---
					</AlertDialog.Title>
					<AlertDialog.Description className="mt-3 leading-relaxed text-foreground/75">
						Your progress will remain in this browser. Your certificate link stops working and you
						leave the Finishers list. Cloud saving stays off until you explicitly enable it again.
					</AlertDialog.Description>
					<div className="mt-5 flex justify-end gap-3">
						<AlertDialog.Close
							render={
								<button
									aria-label="Keep cloud save"
									className="inline-flex min-h-11 items-center text-karma-green hover:[text-shadow:0_0_6px_currentColor] focus-visible:outline-2 focus-visible:outline-karma-yellow"
									type="button"
								/>
							}
						>
							<Bracketed>Keep cloud save</Bracketed>
						</AlertDialog.Close>
						<AlertDialog.Close
							render={
								<button
									aria-label="Yes, delete cloud save"
									className="inline-flex min-h-11 items-center border border-karma-pink/60 px-3 py-2 text-karma-pink hover:bg-karma-pink/10 focus-visible:outline-2 focus-visible:outline-karma-pink"
									onClick={onReset}
									type="button"
								/>
							}
						>
							<Bracketed>Yes, delete cloud save</Bracketed>
						</AlertDialog.Close>
					</div>
				</AlertDialog.Popup>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
}
