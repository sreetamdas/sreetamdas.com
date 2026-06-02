import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { describe, expect, test } from "vitest";

import * as schema from "@/db/schema";
import { incrementLikeCount } from "@/lib/components/LikeButton.serverFns";

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

describe("PageViews likes boundary", () => {
	test("incrementLikeCount ignores unknown blog slugs without creating rows", async () => {
		const db = createFakeLikesDb();
		const deps = createFakeLikeDeps(db);

		const result = await incrementLikeCount(
			{ slug: "/blog/forged-post", disabled: false },
			undefined,
			deps,
		);

		expect(result).toEqual({ likes: 0, hasLiked: false });
		expect(db.pageDetails).toEqual([]);
		expect(db.postLikes).toEqual([]);
	});

	test("incrementLikeCount allows known published blog slugs", async () => {
		const db = createFakeLikesDb();
		const deps = createFakeLikeDeps(db);

		expect(
			await incrementLikeCount({ slug: "/blog/chameleon-text", disabled: false }, undefined, deps),
		).toEqual({ likes: 1, hasLiked: true });
		expect(
			await incrementLikeCount({ slug: "/blog/chameleon-text", disabled: false }, undefined, deps),
		).toEqual({ likes: 1, hasLiked: true });
		expect(db.pageDetails).toEqual([{ slug: "/blog/chameleon-text", likes: 1 }]);
		expect(db.postLikes).toEqual([{ slug: "/blog/chameleon-text", visitorHash: "visitor-hash" }]);
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

type FakeLikesDb = {
	pageDetails: Array<{ slug: string; likes: number }>;
	postLikes: Array<{ slug: string; visitorHash: string }>;
};

function createFakeLikesDb(): FakeLikesDb {
	return { pageDetails: [], postLikes: [] };
}

function createFakeLikeDeps(db: FakeLikesDb) {
	return {
		getDb: (_env: CloudflareEnv | undefined) => {
			return db;
		},
		getLikes: async (fakeDb: FakeLikesDb, slug: string, visitorHash?: string) => {
			return getFakeLikes(fakeDb, slug, visitorHash);
		},
		incrementLikes: async (fakeDb: FakeLikesDb, slug: string, visitorHash: string) => {
			const existingLike = fakeDb.postLikes.some(
				(row) => row.slug === slug && row.visitorHash === visitorHash,
			);

			if (!existingLike) {
				fakeDb.postLikes.push({ slug, visitorHash });
				const pageDetails = fakeDb.pageDetails.find((row) => row.slug === slug);
				if (pageDetails) {
					pageDetails.likes += 1;
				} else {
					fakeDb.pageDetails.push({ slug, likes: 1 });
				}
			}

			return getFakeLikes(fakeDb, slug, visitorHash);
		},
		getVisitorHash: async (_env: CloudflareEnv | undefined, _normalizedSlug: string) => {
			return "visitor-hash";
		},
	};
}

function getFakeLikes(fakeDb: FakeLikesDb, slug: string, visitorHash?: string) {
	return {
		likes: fakeDb.pageDetails.find((row) => row.slug === slug)?.likes ?? 0,
		hasLiked: visitorHash
			? fakeDb.postLikes.some((row) => row.slug === slug && row.visitorHash === visitorHash)
			: false,
	};
}
