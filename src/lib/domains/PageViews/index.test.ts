import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import assert from "node:assert/strict";
import { describe, test } from "node:test";

import * as schema from "@/db/schema";

import type { PageViewsDb } from "./index";

import { getPageViews, upsertPageViews } from "./index";

describe("PageViews domain", () => {
	test("upsertPageViews inserts then increments the same slug", async () => {
		const db = createPageViewsDb();

		assert.deepEqual(await upsertPageViews(db, "/about"), { view_count: 1 });
		assert.deepEqual(await upsertPageViews(db, "/about"), { view_count: 2 });
		assert.deepEqual(await getPageViews(db, "/about"), { view_count: 2 });
	});

	test("upsertPageViews keeps counters isolated by slug", async () => {
		const db = createPageViewsDb();

		await upsertPageViews(db, "/about");
		await upsertPageViews(db, "/about");
		await upsertPageViews(db, "/uses");

		assert.deepEqual(await getPageViews(db, "/about"), { view_count: 2 });
		assert.deepEqual(await getPageViews(db, "/uses"), { view_count: 1 });
	});

	test("getPageViews throws with slug context when page is missing", async () => {
		const db = createPageViewsDb();

		await assert.rejects(
			() => getPageViews(db, "/missing"),
			(error: unknown) => {
				assert.equal(error instanceof Error, true);
				if (!(error instanceof Error)) {
					return false;
				}
				assert.equal(error.message, "Page has not been added to the database yet");
				assert.deepEqual(error.cause, { slug: "/missing" });
				return true;
			},
		);
	});
});

function createPageViewsDb(): PageViewsDb {
	const sqlite = new Database(":memory:");
	sqlite.exec(`
		CREATE TABLE page_details (
			id integer PRIMARY KEY AUTOINCREMENT,
			slug text NOT NULL UNIQUE,
			view_count integer DEFAULT 0 NOT NULL,
			likes integer DEFAULT 0 NOT NULL,
			created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
			updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
		);
	`);

	const db = drizzle({ client: sqlite, schema });
	return db;
}
