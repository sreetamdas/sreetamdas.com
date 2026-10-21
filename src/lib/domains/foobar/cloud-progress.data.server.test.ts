import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { beforeEach, describe, expect, test } from "vitest";

import * as schema from "@/db/schema";

import { FOOBAR_PUZZLE_PREREQUISITES, FOOBAR_REQUIRED_ACHIEVEMENTS } from "./catalog";
import {
	getFoobarCommunity,
	getFoobarCertificate,
	loadFoobarProgressState,
	loadFoobarProgress,
	enableFoobarProgress,
	resetFoobarProgress,
	setFoobarPublicProfile,
	syncFoobarProgress,
	type FoobarProgressDb,
} from "./cloud-progress.data.server";
import { initialFoobarData } from "./store";

let db: FoobarProgressDb;

beforeEach(() => {
	const sqlite = new Database(":memory:");
	sqlite.exec(`
		PRAGMA foreign_keys = ON;
		CREATE TABLE user (
			id text PRIMARY KEY NOT NULL,
			name text NOT NULL,
			email text UNIQUE NOT NULL,
			email_verified integer NOT NULL,
			image text,
			created_at integer NOT NULL,
			updated_at integer NOT NULL
		);
		CREATE TABLE foobar_progress (
			user_id text PRIMARY KEY NOT NULL REFERENCES user(id) ON DELETE CASCADE,
			progress_json text NOT NULL,
			completed_at integer,
				public_profile integer DEFAULT 0 NOT NULL,
				sync_enabled integer DEFAULT 1 NOT NULL,
			certificate_id text UNIQUE,
			created_at integer NOT NULL,
			updated_at integer NOT NULL
		);
	`);
	db = drizzle({ client: sqlite, schema });
});

describe("Foobar cloud progress data", () => {
	test("merge-upserts progress and never lets stale writes erase discoveries", async () => {
		await addUser("a", "Ada");
		await syncFoobarProgress(
			db,
			"a",
			{
				...initialFoobarData,
				unlocked: true,
				completed: ["headers"],
			},
			100,
			() => "unused",
		);
		const result = await syncFoobarProgress(
			db,
			"a",
			{
				...initialFoobarData,
				completed: ["teapot"],
			},
			200,
			() => "unused",
		);

		expect(result.progress.unlocked).toBe(true);
		expect(result.progress.completed).toEqual(["teapot", "headers"]);
		expect((await loadFoobarProgress(db, "a"))?.progress).toEqual(result.progress);
	});

	test("keeps both discoveries when two devices sync at the same time", async () => {
		await addUser("a", "Ada");
		await syncFoobarProgress(db, "a", { ...initialFoobarData, completed: ["unlocked"] }, 100);

		// Both calls load the stored row before either writes.
		await Promise.all([
			syncFoobarProgress(db, "a", { ...initialFoobarData, completed: ["headers"] }, 200),
			syncFoobarProgress(db, "a", { ...initialFoobarData, completed: ["teapot"] }, 200),
		]);

		expect((await loadFoobarProgress(db, "a"))?.progress.completed).toEqual(
			expect.arrayContaining(["unlocked", "headers", "teapot"]),
		);
	});

	test("creates one stable certificate and completion timestamp", async () => {
		await addUser("a", "Ada");
		const complete = {
			...initialFoobarData,
			unlocked: true,
			completed: [...FOOBAR_REQUIRED_ACHIEVEMENTS],
		};
		const first = await syncFoobarProgress(db, "a", complete, 100, () => "cert-a");
		const second = await syncFoobarProgress(db, "a", complete, 200, () => "cert-b");

		expect(first).toMatchObject({ completedAt: 100, certificateId: "cert-a" });
		expect(second).toMatchObject({ completedAt: 100, certificateId: "cert-a" });
		expect(await getFoobarCertificate(db, "cert-a")).toEqual({
			name: "Ada",
			completedAt: 100,
			certificateId: "cert-a",
		});
	});

	test("gives no certificate for every flag except the final puzzle", async () => {
		await addUser("a", "Ada");
		const result = await syncFoobarProgress(
			db,
			"a",
			{ ...initialFoobarData, unlocked: true, completed: [...FOOBAR_PUZZLE_PREREQUISITES] },
			100,
			() => "cert-a",
		);

		expect(result).toMatchObject({ completedAt: null, certificateId: null });
		expect(result.progress.all_achievements).toBe(false);
		expect(await getFoobarCertificate(db, "cert-a")).toBeNull();
	});

	test("dates a finish from the last required discovery, never the future", async () => {
		await addUser("a", "Ada");
		await addUser("b", "Bea");
		const finishedAt = (finalSeenAt: number) => ({
			...initialFoobarData,
			completed: [...FOOBAR_REQUIRED_ACHIEVEMENTS],
			clues_seen: [
				{ id: "headers:completed", seen_at: 40 },
				{ id: "completed:completed", seen_at: finalSeenAt },
			],
		});

		const past = await syncFoobarProgress(db, "a", finishedAt(80), 100, () => "cert-a");
		const future = await syncFoobarProgress(db, "b", finishedAt(5_000), 100, () => "cert-b");

		expect(past.completedAt).toBe(80);
		expect(future.completedAt).toBe(100);
	});

	test("leaves finishes from before the final puzzle off the Finishers list", async () => {
		await addUser("a", "Ada");
		await addUser("b", "Bea");
		await db.insert(schema.foobarProgress).values({
			userId: "a",
			progressJson: JSON.stringify({
				...initialFoobarData,
				completed: [...FOOBAR_PUZZLE_PREREQUISITES],
			}),
			completedAt: 50,
			certificateId: "cert-legacy",
			publicProfile: true,
			syncEnabled: true,
			createdAt: 50,
			updatedAt: 50,
		});
		await syncFoobarProgress(
			db,
			"b",
			{ ...initialFoobarData, completed: [...FOOBAR_REQUIRED_ACHIEVEMENTS] },
			200,
			() => "cert-b",
		);
		await setFoobarPublicProfile(db, "b", true);

		expect(await getFoobarCommunity(db)).toEqual({
			finisherCount: 1,
			leaderboard: [{ name: "Bea", completedAt: 200, certificateId: "cert-b" }],
		});
		expect(await getFoobarCertificate(db, "cert-legacy")).toMatchObject({ completedAt: 50 });
	});

	test("counts every finisher but ranks only opted-in profiles", async () => {
		await addUser("a", "Ada");
		await addUser("b", "Bea");
		const complete = { ...initialFoobarData, completed: [...FOOBAR_REQUIRED_ACHIEVEMENTS] };
		await syncFoobarProgress(db, "a", complete, 100, () => "cert-a");
		await syncFoobarProgress(db, "b", complete, 200, () => "cert-b");
		await setFoobarPublicProfile(db, "b", true);

		expect(await getFoobarCommunity(db)).toEqual({
			finisherCount: 2,
			leaderboard: [{ name: "Bea", completedAt: 200, certificateId: "cert-b" }],
		});
	});

	test("keeps a durable tombstone when cloud sync is disabled", async () => {
		await addUser("a", "Ada");
		await syncFoobarProgress(db, "a", initialFoobarData, 100, () => "unused");
		await resetFoobarProgress(db, "a");

		expect(await loadFoobarProgressState(db, "a")).toEqual({
			cloud: null,
			syncEnabled: false,
		});
	});

	test("rejects a stale sync after cloud sync has been disabled", async () => {
		await addUser("a", "Ada");
		await syncFoobarProgress(db, "a", { ...initialFoobarData, unlocked: true });
		await resetFoobarProgress(db, "a");

		await expect(
			syncFoobarProgress(db, "a", { ...initialFoobarData, completed: ["headers"] }),
		).rejects.toThrow("Foobar cloud sync is disabled");
		expect(await loadFoobarProgressState(db, "a")).toEqual({
			cloud: null,
			syncEnabled: false,
		});
	});

	test("lets deletion win when an earlier sync request is still in flight", async () => {
		await addUser("a", "Ada");
		await syncFoobarProgress(db, "a", { ...initialFoobarData, unlocked: true });

		const staleSync = syncFoobarProgress(db, "a", {
			...initialFoobarData,
			completed: ["headers"],
		});
		await resetFoobarProgress(db, "a");

		await expect(staleSync).rejects.toThrow("Foobar cloud sync is disabled");
		expect(await loadFoobarProgressState(db, "a")).toEqual({
			cloud: null,
			syncEnabled: false,
		});
	});

	test("re-enables cloud sync only through the explicit enable operation", async () => {
		await addUser("a", "Ada");
		await syncFoobarProgress(db, "a", { ...initialFoobarData, unlocked: true });
		await resetFoobarProgress(db, "a");

		const enabled = await enableFoobarProgress(db, "a", {
			...initialFoobarData,
			completed: ["headers"],
		});

		expect(enabled.progress.completed).toEqual(["headers"]);
		expect(await loadFoobarProgressState(db, "a")).toEqual({
			cloud: enabled,
			syncEnabled: true,
		});
	});

	test("does not let a stale profile update mutate a disabled tombstone", async () => {
		await addUser("a", "Ada");
		await syncFoobarProgress(db, "a", initialFoobarData);
		await resetFoobarProgress(db, "a");

		expect(await setFoobarPublicProfile(db, "a", true)).toBe(false);
		const enabled = await enableFoobarProgress(db, "a", initialFoobarData);
		expect(enabled.publicProfile).toBe(false);
	});
});

async function addUser(id: string, name: string) {
	await db.insert(schema.authUser).values({
		id,
		name,
		email: `${id}@example.com`,
		emailVerified: true,
		createdAt: new Date(0),
		updatedAt: new Date(0),
	});
}
