/**
 * Server-function boundary for Foobar cloud saves. Reads fail soft so the
 * anonymous game remains available during database outages; authenticated
 * mutations fail loudly instead of pretending progress was saved.
 */
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";

import { normalizeFoobarData, type FoobarDataType } from "./store";

export type FoobarCommunityView = {
	finisherCount: number;
	leaderboard: Array<{ name: string; completedAt: number; certificateId: string }>;
};

export type FoobarBootstrap = {
	user: { name: string } | null;
	cloud: {
		progress: FoobarDataType;
		completedAt: number | null;
		publicProfile: boolean;
		certificateId: string | null;
	} | null;
	cloudSyncEnabled: boolean | null;
	community: FoobarCommunityView;
};

const EMPTY_COMMUNITY: FoobarCommunityView = { finisherCount: 0, leaderboard: [] };

export const fetchFoobarBootstrapServerFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<FoobarBootstrap> => {
		try {
			return await fetchFoobarBootstrapFromDb();
		} catch {
			return { user: null, cloud: null, cloudSyncEnabled: false, community: EMPTY_COMMUNITY };
		}
	},
);

export const syncFoobarProgressServerFn = createServerFn({ method: "POST" })
	.validator((value) => ({ progress: normalizeFoobarData(readProgress(value)) }))
	.handler(async ({ data }) => syncFoobarProgressInDb(data.progress));

export const enableFoobarProgressServerFn = createServerFn({ method: "POST" })
	.validator((value) => ({ progress: normalizeFoobarData(readProgress(value)) }))
	.handler(async ({ data }) => enableFoobarProgressInDb(data.progress));

export const setFoobarPublicProfileServerFn = createServerFn({ method: "POST" })
	.validator((value) => ({ publicProfile: readPublicProfile(value) }))
	.handler(async ({ data }) => setFoobarPublicProfileInDb(data.publicProfile));

export const resetFoobarProgressServerFn = createServerFn({ method: "POST" }).handler(async () =>
	resetFoobarProgressInDb(),
);

const fetchFoobarBootstrapFromDb = createServerOnlyFn(async (): Promise<FoobarBootstrap> => {
	const [{ getDb }, data, request] = await Promise.all([
		import("@/db"),
		import("./cloud-progress.data.server"),
		import("./cloud-progress.request.server"),
	]);
	const db = getDb();
	// The community query does not depend on the user, so it runs alongside the
	// auth lookup instead of after it.
	const communityPromise = data.getFoobarCommunity(db).catch(() => EMPTY_COMMUNITY);
	const user = await request.getFoobarAuthUser();
	if (!user) {
		return { user: null, cloud: null, cloudSyncEnabled: false, community: await communityPromise };
	}

	try {
		const state = await data.loadFoobarProgressState(db, user.id);
		return {
			user: { name: user.name },
			cloud: state.cloud,
			cloudSyncEnabled: state.syncEnabled,
			community: await communityPromise,
		};
	} catch {
		return {
			user: { name: user.name },
			cloud: null,
			cloudSyncEnabled: null,
			community: await communityPromise,
		};
	}
});

const syncFoobarProgressInDb = createServerOnlyFn(async (progress: FoobarDataType) => {
	const [{ getDb }, data, request] = await Promise.all([
		import("@/db"),
		import("./cloud-progress.data.server"),
		import("./cloud-progress.request.server"),
	]);
	const user = await request.getFoobarAuthUser();
	if (!user) throw new Error("Sign in to save Foobar progress");
	const cloud = await data.syncFoobarProgress(getDb(), user.id, progress);
	return { cloud, community: await data.getFoobarCommunity(getDb()) };
});

const enableFoobarProgressInDb = createServerOnlyFn(async (progress: FoobarDataType) => {
	const [{ getDb }, data, request] = await Promise.all([
		import("@/db"),
		import("./cloud-progress.data.server"),
		import("./cloud-progress.request.server"),
	]);
	const user = await request.getFoobarAuthUser();
	if (!user) throw new Error("Sign in to enable Foobar cloud progress");
	const cloud = await data.enableFoobarProgress(getDb(), user.id, progress);
	return { cloud, community: await data.getFoobarCommunity(getDb()) };
});

const setFoobarPublicProfileInDb = createServerOnlyFn(async (publicProfile: boolean) => {
	const [{ getDb }, data, request] = await Promise.all([
		import("@/db"),
		import("./cloud-progress.data.server"),
		import("./cloud-progress.request.server"),
	]);
	const user = await request.getFoobarAuthUser();
	if (!user) throw new Error("Sign in to publish a Foobar profile");
	return data.setFoobarPublicProfile(getDb(), user.id, publicProfile);
});

const resetFoobarProgressInDb = createServerOnlyFn(async () => {
	const [{ getDb }, data, request] = await Promise.all([
		import("@/db"),
		import("./cloud-progress.data.server"),
		import("./cloud-progress.request.server"),
	]);
	const user = await request.getFoobarAuthUser();
	if (!user) throw new Error("Sign in to reset Foobar cloud progress");
	await data.resetFoobarProgress(getDb(), user.id);
});

function readProgress(value: unknown): unknown {
	if (typeof value !== "object" || value === null || !("progress" in value)) {
		throw new Error("Invalid Foobar sync payload");
	}
	return value.progress;
}

function readPublicProfile(value: unknown): boolean {
	if (
		typeof value !== "object" ||
		value === null ||
		!("publicProfile" in value) ||
		typeof value.publicProfile !== "boolean"
	) {
		throw new Error("Invalid Foobar public profile payload");
	}
	return value.publicProfile;
}
