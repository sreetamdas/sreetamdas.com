import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { describe, expect, test } from "vitest";

import * as schema from "@/db/schema";
import { pageDetails, postLikes } from "@/db/schema";

import type { PageLikesDb, PageLikesTestDb, PageViewsDb } from "./index";

import { getLikes, getPageViews, incrementLikes, upsertPageViews } from "./index";

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

describe("getLikes", () => {
	test("returns zeros for a missing slug", async () => {
		const db = createLikesDb();

		expect(await getLikes(db, "/blog/missing")).toEqual({ likes: 0, hasLiked: false });
	});

	test("reads seeded page likes without a visitor like", async () => {
		const db = createLikesDb();
		await db.insert(pageDetails).values({ slug: "/blog/x", viewCount: 0, likes: 3 });

		expect(await getLikes(db, "/blog/x")).toEqual({ likes: 3, hasLiked: false });
		expect(await getLikes(db, "/blog/x", "h1")).toEqual({ likes: 3, hasLiked: false });
	});

	test("reports whether the visitor already liked the slug", async () => {
		const db = createLikesDb();
		await db.insert(pageDetails).values({ slug: "/blog/x", viewCount: 0, likes: 3 });
		await db.insert(postLikes).values({ slug: "/blog/x", visitorHash: "h1" });

		expect(await getLikes(db, "/blog/x", "h1")).toEqual({ likes: 3, hasLiked: true });
		expect(await getLikes(db, "/blog/x", "h2")).toEqual({ likes: 3, hasLiked: false });
		expect(await getLikes(db, "/blog/x")).toEqual({ likes: 3, hasLiked: false });
	});
});

describe("incrementLikes", () => {
	test("inserts the first like", async () => {
		const db = createLikesDb();

		expect(await incrementLikes(db, "/blog/x", "h1")).toEqual({ likes: 1, hasLiked: true });
		expect(await getPostLikesCount(db, "/blog/x")).toBe(1);
		expect(await getPageLikes(db, "/blog/x")).toBe(1);
	});

	test("does not increment twice for the same visitor", async () => {
		const db = createLikesDb();

		await incrementLikes(db, "/blog/x", "h1");

		expect(await incrementLikes(db, "/blog/x", "h1")).toEqual({ likes: 1, hasLiked: true });
		expect(await getPostLikesCount(db, "/blog/x")).toBe(1);
		expect(await getPageLikes(db, "/blog/x")).toBe(1);
	});

	test("keeps a pre-existing visitor like from incrementing again", async () => {
		const db = createLikesDb();
		await db.insert(pageDetails).values({ slug: "/blog/x", viewCount: 0, likes: 1 });
		await db.insert(postLikes).values({ slug: "/blog/x", visitorHash: "h1" });

		expect(await incrementLikes(db, "/blog/x", "h1")).toEqual({ likes: 1, hasLiked: true });
		expect(await getPostLikesCount(db, "/blog/x")).toBe(1);
		expect(await getPageLikes(db, "/blog/x")).toBe(1);
	});

	test("repairs stale page likes from recorded visitor likes", async () => {
		const db = createLikesDb();
		await db.insert(pageDetails).values({ slug: "/blog/x", viewCount: 0, likes: 0 });
		await db.insert(postLikes).values({ slug: "/blog/x", visitorHash: "h1" });
		await db.insert(postLikes).values({ slug: "/blog/x", visitorHash: "h2" });

		expect(await incrementLikes(db, "/blog/x", "h1")).toEqual({ likes: 2, hasLiked: true });
		expect(await getPostLikesCount(db, "/blog/x")).toBe(2);
		expect(await getPageLikes(db, "/blog/x")).toBe(2);
	});

	test("increments for a second visitor", async () => {
		const db = createLikesDb();

		await incrementLikes(db, "/blog/x", "h1");

		expect(await incrementLikes(db, "/blog/x", "h2")).toEqual({ likes: 2, hasLiked: true });
		expect(await getPostLikesCount(db, "/blog/x")).toBe(2);
		expect(await getPageLikes(db, "/blog/x")).toBe(2);
	});

	test("keeps likes isolated by slug", async () => {
		const db = createLikesDb();

		await incrementLikes(db, "/blog/x", "h1");
		expect(await incrementLikes(db, "/blog/y", "h1")).toEqual({ likes: 1, hasLiked: true });

		expect(await getLikes(db, "/blog/x", "h1")).toEqual({ likes: 1, hasLiked: true });
		expect(await getLikes(db, "/blog/y", "h1")).toEqual({ likes: 1, hasLiked: true });
	});

	test("normalizes trailing slashes", async () => {
		const db = createLikesDb();

		expect(await incrementLikes(db, "/blog/x/", "h1")).toEqual({ likes: 1, hasLiked: true });

		expect(await getLikes(db, "/blog/x", "h1")).toEqual({ likes: 1, hasLiked: true });
		expect(await getPostLikesCount(db, "/blog/x")).toBe(1);
		expect(await getPostLikesCount(db, "/blog/x/")).toBe(0);
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

	return createBatchablePageViewsDb(sqlite);
}

function createLikesDb(): PageLikesDb {
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

		CREATE TABLE post_likes (
			slug text NOT NULL,
			visitor_hash text NOT NULL,
			created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
		);

		CREATE UNIQUE INDEX post_likes_slug_visitor_hash_unique
		ON post_likes (slug, visitor_hash);
	`);

	return createBatchablePageViewsDb(sqlite);
}

async function getPostLikesCount(db: PageViewsDb, slug: string): Promise<number> {
	const rows = await db
		.select({ visitorHash: postLikes.visitorHash })
		.from(postLikes)
		.where(eq(postLikes.slug, slug));
	return rows.length;
}

async function getPageLikes(db: PageViewsDb, slug: string): Promise<number> {
	const rows = await db
		.select({ likes: pageDetails.likes })
		.from(pageDetails)
		.where(eq(pageDetails.slug, slug))
		.limit(1);

	return rows[0]?.likes ?? 0;
}

function createBatchablePageViewsDb(sqlite: Database.Database): PageLikesTestDb {
	return Object.assign(drizzle({ client: sqlite, schema }), {
		batch: ([first, second]: Parameters<PageLikesTestDb["batch"]>[0]) =>
			Promise.all([first, second]),
	});
}
