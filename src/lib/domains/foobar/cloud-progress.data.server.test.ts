import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { beforeEach, describe, expect, test } from "vitest";

import * as schema from "@/db/schema";

import { FOOBAR_REQUIRED_ACHIEVEMENTS } from "./catalog";
import {
	getFoobarCommunity,
	loadFoobarProgress,
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

	test("resets only the signed-in user's cloud copy", async () => {
		await addUser("a", "Ada");
		await syncFoobarProgress(db, "a", initialFoobarData, 100, () => "unused");
		await resetFoobarProgress(db, "a");
		expect(await loadFoobarProgress(db, "a")).toBeNull();
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
