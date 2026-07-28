"use client";

/**
 * Optional account-backed Foobar save UI. Anonymous localStorage remains the
 * default; after sign-in the browser and D1 copies are merged before background
 * sync begins, so neither device can overwrite discoveries from the other.
 */
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useGlobalStore } from "@/lib/domains/global";

import { mergeFoobarProgress } from "./cloud-progress";
import {
	fetchFoobarBootstrapServerFn,
	resetFoobarProgressServerFn,
	setFoobarPublicProfileServerFn,
	syncFoobarProgressServerFn,
	type FoobarBootstrap,
} from "./cloud-progress.server";

type SyncState = "loading" | "local" | "saving" | "saved" | "error";

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
	const [confirmingCloudReset, setConfirmingCloudReset] = useState(false);
	const lastSynced = useRef("");

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

				const current = useGlobalStore.getState().foobar_data;
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
				const synced = await syncFoobarProgressServerFn({ data: { progress: merged } });
				if (!active) return;
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
		if (!bootstrap?.user || !bootstrap.cloud) return;
		const serialized = JSON.stringify(foobarData);
		if (serialized === lastSynced.current) return;

		const timeout = setTimeout(() => {
			setSyncState("saving");
			void syncFoobarProgressServerFn({ data: { progress: foobarData } })
				.then((synced) => {
					lastSynced.current = JSON.stringify(synced.cloud.progress);
					setFoobarData(synced.cloud.progress);
					setBootstrap((value) =>
						value ? { ...value, cloud: synced.cloud, community: synced.community } : value,
					);
					setSyncState("saved");
				})
				.catch(() => setSyncState("error"));
		}, 700);

		return () => clearTimeout(timeout);
	}, [bootstrap?.user, foobarData, setFoobarData]);

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
		setConfirmingCloudReset(false);
		try {
			await resetFoobarProgressServerFn();
			// Keep lastSynced at the current local state so the debounced sync does
			// not immediately recreate the deleted row from this browser.
			lastSynced.current = JSON.stringify(useGlobalStore.getState().foobar_data);
			setBootstrap((value) => (value ? { ...value, cloud: null } : value));
			setSyncState("local");
		} catch {
			setSyncState("error");
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
						confirmingCloudReset ? (
							<div className="flex flex-wrap items-center gap-2">
								<button
									className="rounded-global border border-red-300 px-3 py-1.5 text-red-700 hover:bg-red-100"
									onClick={() => void handleCloudReset()}
									type="button"
								>
									Yes, delete cloud save
								</button>
								<button
									className="rounded-global border border-foreground/25 px-3 py-1.5"
									onClick={() => setConfirmingCloudReset(false)}
									type="button"
								>
									Keep it
								</button>
							</div>
						) : (
							<button
								className="rounded-global border border-foreground/25 px-3 py-1.5 text-foreground/75 hover:border-red-300 hover:text-red-700"
								onClick={() => setConfirmingCloudReset(true)}
								type="button"
							>
								Delete cloud save
							</button>
						)
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
	if (state === "error") return "Cloud save needs another try.";
	if (state === "local") return "Cloud save deleted. Progress stays in this browser.";
	return "Progress saved.";
}
