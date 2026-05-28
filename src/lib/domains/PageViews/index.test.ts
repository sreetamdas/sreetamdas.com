import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { describe, expect, test } from "vitest";

import * as schema from "@/db/schema";

import type { PageViewsDb } from "./index";

import { getPageViews, upsertPageViews } from "./index";

describe("PageViews domain", () => {
	test("upsertPageViews inserts then increments the same slug", async () => {
		const db = createPageViewsDb();

		expect(await upsertPageViews(db, "/about")).toEqual({ view_count: 1 });
		expect(await upsertPageViews(db, "/about")).toEqual({ view_count: 2 });
		expect(await getPageViews(db, "/about")).toEqual({ view_count: 2 });
	});

	test("upsertPageViews keeps counters isolated by slug", async () => {
		const db = createPageViewsDb();

		await upsertPageViews(db, "/about");
		await upsertPageViews(db, "/about");
		await upsertPageViews(db, "/uses");

		expect(await getPageViews(db, "/about")).toEqual({ view_count: 2 });
		expect(await getPageViews(db, "/uses")).toEqual({ view_count: 1 });
	});

	test("getPageViews throws with slug context when page is missing", async () => {
		const db = createPageViewsDb();

		await expect(getPageViews(db, "/missing")).rejects.toMatchObject({
			cause: { slug: "/missing" },
			message: "Page has not been added to the database yet",
		});
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
