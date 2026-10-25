/*
Real-workerd coverage for certificate minting and the Finishers query. The unit
tests inject a fake certificate ID factory and run in Node, which tolerates an
unbound `crypto.randomUUID`; workerd throws "Illegal invocation" for the same
call. The Finishers count relies on D1's json_each, so it is checked here too.
*/

import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { beforeEach, describe, expect, it } from "vitest";

import { FOOBAR_REQUIRED_ACHIEVEMENTS } from "./catalog";
import { getFoobarCommunity, syncFoobarProgress } from "./cloud-progress.data.server";
import { initialFoobarData } from "./store";

const SCHEMA_STATEMENTS = [
	"DROP TABLE IF EXISTS foobar_progress",
	"DROP TABLE IF EXISTS user",
	"CREATE TABLE user (id text PRIMARY KEY NOT NULL, name text NOT NULL, email text UNIQUE NOT NULL, email_verified integer NOT NULL, image text, created_at integer NOT NULL, updated_at integer NOT NULL)",
	"CREATE TABLE foobar_progress (user_id text PRIMARY KEY NOT NULL REFERENCES user(id) ON DELETE CASCADE, progress_json text NOT NULL, completed_at integer, public_profile integer DEFAULT 0 NOT NULL, sync_enabled integer DEFAULT 1 NOT NULL, certificate_id text UNIQUE, created_at integer NOT NULL, updated_at integer NOT NULL)",
	"INSERT INTO user (id, name, email, email_verified, created_at, updated_at) VALUES ('hunter', 'Hunter', 'hunter@example.invalid', 1, 0, 0)",
];

const db = drizzle(env.D1);

describe("Foobar certificates on workerd", () => {
	beforeEach(async () => {
		await env.D1.batch(SCHEMA_STATEMENTS.map((statement) => env.D1.prepare(statement)));
	});

	it("mints a certificate with the default ID factory", async () => {
		const cloud = await syncFoobarProgress(db, "hunter", {
			...initialFoobarData,
			unlocked: true,
			completed: [...FOOBAR_REQUIRED_ACHIEVEMENTS],
		});

		expect(cloud.completedAt).not.toBeNull();
		expect(cloud.certificateId).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
		);
		expect((await getFoobarCommunity(db)).finisherCount).toBe(1);
	});
});
