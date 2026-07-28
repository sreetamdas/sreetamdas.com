"use client";

/**
 * Optional account-backed Foobar save UI. Anonymous localStorage remains the
 * default; after sign-in the browser and D1 copies are merged before background
 * sync begins, so neither device can overwrite discoveries from the other.
 */
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useGlobalStore } from "@/lib/domains/global";

import { mergeFoobarProgress } from "./cloud-progress";
import {
	enableFoobarProgressServerFn,
	fetchFoobarBootstrapServerFn,
	resetFoobarProgressServerFn,
	setFoobarPublicProfileServerFn,
	syncFoobarProgressServerFn,
	type FoobarBootstrap,
} from "./cloud-progress.server";
import { createFoobarCloudSyncSession } from "./cloud-sync-session";

type SyncState = "loading" | "local" | "saving" | "saved" | "deleting" | "disabled" | "error";

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
	const lastSynced = useRef("");
	const syncSession = useRef(createFoobarCloudSyncSession());

	useEffect(() => {
		if (!hasHydrated) return;
		let active = true;

		void fetchFoobarBootstrapServerFn()
			.then(async (result) => {
				if (!active) return;
				setBootstrap(result);
				if (!result.user) {
					setSyncState("local");
					return;
				}
				if (result.cloudSyncEnabled === null) {
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
				} catch {
					if (active && syncSession.current.isCurrent(token)) setSyncState("error");
					return;
				}
				if (!active || !syncSession.current.isCurrent(token)) return;
				lastSynced.current = JSON.stringify(synced.cloud.progress);
				setFoobarData(synced.cloud.progress);
				setBootstrap((value) =>
					value ? { ...value, cloud: synced.cloud, community: synced.community } : value,
				);
				setSyncState("saved");
			})
			.catch(() => {
				if (active) setSyncState("error");
			});

		return () => {
			active = false;
		};
	}, [hasHydrated, setFoobarData]);

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
					setFoobarData(synced.cloud.progress);
					setBootstrap((value) =>
						value ? { ...value, cloud: synced.cloud, community: synced.community } : value,
					);
					setSyncState("saved");
				})
				.catch(() => {
					if (syncSession.current.isCurrent(token)) setSyncState("error");
				});
		}, 700);

		return () => clearTimeout(timeout);
	}, [bootstrap?.cloudSyncEnabled, bootstrap?.user, foobarData, setFoobarData]);

	async function handlePublicProfile(publicProfile: boolean) {
		setBootstrap((value) =>
			value?.cloud ? { ...value, cloud: { ...value.cloud, publicProfile } } : value,
		);
		try {
			await setFoobarPublicProfileServerFn({ data: { publicProfile } });
		} catch {
			setBootstrap((value) =>
				value?.cloud
					? { ...value, cloud: { ...value.cloud, publicProfile: !publicProfile } }
					: value,
			);
			setSyncState("error");
		}
	}

	async function handleCloudReset() {
		syncSession.current.invalidate();
		setSyncState("deleting");
		setBootstrap((value) => (value ? { ...value, cloud: null, cloudSyncEnabled: false } : value));
		try {
			await resetFoobarProgressServerFn();
			lastSynced.current = JSON.stringify(useGlobalStore.getState().foobar_data);
			setSyncState("disabled");
		} catch {
			setSyncState("error");
		}
	}

	async function handleCloudEnable() {
		setSyncState("saving");
		const progress = useGlobalStore.getState().foobar_data;
		const token = syncSession.current.begin();
		try {
			const synced = await enableFoobarProgressServerFn({ data: { progress } });
			if (!syncSession.current.isCurrent(token)) return;
			lastSynced.current = JSON.stringify(synced.cloud.progress);
			setFoobarData(synced.cloud.progress);
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
			setSyncState("saved");
		} catch {
			if (syncSession.current.isCurrent(token)) setSyncState("error");
		}
	}

	const community = bootstrap?.community ?? { finisherCount: 0, leaderboard: [] };

	return (
		<section
			aria-labelledby="foobar-cloud-title"
			className="mt-8 border-t border-foreground/15 pt-5"
		>
			<div className="flex flex-wrap items-baseline justify-between gap-2">
				<h2 id="foobar-cloud-title" className="font-serif text-2xl leading-normal">
					Hunter registry
				</h2>
				<p className="font-mono text-xs text-foreground/55">
					{community.finisherCount} {community.finisherCount === 1 ? "finisher" : "finishers"}
				</p>
			</div>

			{bootstrap?.user ? (
				<div className="mt-3 space-y-3 text-sm">
					<p>
						Signed in as <strong>{bootstrap.user.name}</strong>. {syncLabel(syncState)}
					</p>
					<label className="flex max-w-md items-start gap-2 text-foreground/75">
						<input
							checked={bootstrap.cloud?.publicProfile ?? false}
							className="mt-1"
							disabled={!bootstrap.cloud}
							onChange={(event) => void handlePublicProfile(event.currentTarget.checked)}
							type="checkbox"
						/>
						<span>List my name and completion time on the public leaderboard.</span>
					</label>
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
							className="rounded-global border border-foreground/25 px-3 py-1.5"
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
						Your progress stays in this browser. Sign in to save progress across devices.
					</p>
					<div className="mt-3 flex flex-wrap gap-2">
						<a
							className="rounded-global border border-foreground/25 px-3 py-1.5"
							href="/api/login/cloudflare?returnTo=/foobar"
						>
							Sign in with Cloudflare
						</a>
						<a
							className="rounded-global border border-foreground/25 px-3 py-1.5"
							href="/api/login/github?returnTo=/foobar"
						>
							Sign in with GitHub
						</a>
					</div>
				</div>
			)}

			{community.leaderboard.length > 0 ? (
				<ol aria-label="Foobar finishers" className="mt-5 space-y-1 text-sm">
					{community.leaderboard.map((entry, index) => (
						<li className="flex max-w-md justify-between gap-4" key={entry.certificateId}>
							<span>
								{index + 1}. {entry.name}
							</span>
							<time dateTime={new Date(entry.completedAt).toISOString()}>
								{new Date(entry.completedAt).toLocaleDateString()}
							</time>
						</li>
					))}
				</ol>
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
		<AlertDialogPrimitive.Root>
			<AlertDialogPrimitive.Trigger asChild>
				<button
					className="rounded-global border border-foreground/25 px-3 py-1.5 text-foreground/75 hover:border-red-300 hover:text-red-700"
					type="button"
				>
					Delete cloud save
				</button>
			</AlertDialogPrimitive.Trigger>
			<AlertDialogPrimitive.Portal>
				<AlertDialogPrimitive.Overlay className="fixed inset-0 bg-slate-950/40 data-[state=open]:animate-overlayShow" />
				<AlertDialogPrimitive.Content className="fixed top-1/2 left-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-global bg-white p-6 text-slate-950 shadow-lg focus:outline-none data-[state=open]:animate-contentShow">
					<AlertDialogPrimitive.Title className="text-lg font-medium">
						Delete your cloud save?
					</AlertDialogPrimitive.Title>
					<AlertDialogPrimitive.Description className="mt-3 text-sm leading-normal text-slate-600">
						Your progress will remain in this browser. Cloud saving stays off until you explicitly
						enable it again.
					</AlertDialogPrimitive.Description>
					<div className="mt-5 flex justify-end gap-3">
						<AlertDialogPrimitive.Cancel asChild>
							<button className="rounded-global bg-slate-100 px-3 py-2 text-sm" type="button">
								Keep cloud save
							</button>
						</AlertDialogPrimitive.Cancel>
						<AlertDialogPrimitive.Action asChild>
							<button
								className="rounded-global bg-red-100 px-3 py-2 text-sm text-red-700"
								onClick={onReset}
								type="button"
							>
								Yes, delete cloud save
							</button>
						</AlertDialogPrimitive.Action>
					</div>
				</AlertDialogPrimitive.Content>
			</AlertDialogPrimitive.Portal>
		</AlertDialogPrimitive.Root>
	);
}
