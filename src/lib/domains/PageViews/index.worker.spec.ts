/*
Real-D1 coverage for the likes batch. The unit test runs against a synchronous
better-sqlite3 double whose db.run executes eagerly, so it cannot prove that
incrementLikes' db.batch array runs in order or that the derived counter is
computed after the insert. These tests run inside workerd against an actual D1
binding, where the batch executes lazily in array order — reversing the
statements would surface here as a stale (zero) counter.
*/

import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { beforeEach, describe, expect, it } from "vitest";

import * as schema from "@/db/schema";
import { pageDetails } from "@/db/schema";

import { incrementLikes } from "./index";

const SCHEMA_STATEMENTS = [
	"DROP TABLE IF EXISTS post_likes",
	"DROP TABLE IF EXISTS page_details",
	"CREATE TABLE page_details (id integer PRIMARY KEY AUTOINCREMENT, slug text NOT NULL, view_count integer DEFAULT 0 NOT NULL, likes integer DEFAULT 0 NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)",
	"CREATE UNIQUE INDEX page_details_slug_unique ON page_details (slug)",
	"CREATE TABLE post_likes (slug text NOT NULL, visitor_hash text NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)",
	"CREATE UNIQUE INDEX post_likes_slug_visitor_hash_unique ON post_likes (slug, visitor_hash)",
];

const db = drizzle(env.D1, { schema });

async function storedLikes(slug: string): Promise<number | null> {
	const rows = await db
		.select({ likes: pageDetails.likes })
		.from(pageDetails)
		.where(eq(pageDetails.slug, slug))
		.limit(1);

	return rows[0]?.likes ?? null;
}

describe("incrementLikes (real D1 batch)", () => {
	beforeEach(async () => {
		for (const statement of SCHEMA_STATEMENTS) {
			await env.D1.prepare(statement).run();
		}
	});

	it("records the visitor like and derives the public counter in one ordered batch", async () => {
		const result = await incrementLikes(db, "/blog/post-a", "visitor-1");

		expect(result).toEqual({ likes: 1, hasLiked: true });
		// If the batch ran the count-sync before the insert, this would be 0.
		expect(await storedLikes("/blog/post-a")).toBe(1);
	});

	it("is idempotent for a repeated visitor", async () => {
		await incrementLikes(db, "/blog/post-a", "visitor-1");
		const result = await incrementLikes(db, "/blog/post-a", "visitor-1");

		expect(result).toEqual({ likes: 1, hasLiked: true });
		expect(await storedLikes("/blog/post-a")).toBe(1);
	});

	it("counts a second distinct visitor", async () => {
		await incrementLikes(db, "/blog/post-a", "visitor-1");
		const result = await incrementLikes(db, "/blog/post-a", "visitor-2");

		expect(result.likes).toBe(2);
		expect(await storedLikes("/blog/post-a")).toBe(2);
	});

	it("repairs a stale public counter from recorded visitor likes", async () => {
		await env.D1.batch([
			env.D1.prepare("INSERT INTO post_likes (slug, visitor_hash) VALUES (?, ?)").bind(
				"/blog/post-a",
				"visitor-1",
			),
			env.D1.prepare("INSERT INTO post_likes (slug, visitor_hash) VALUES (?, ?)").bind(
				"/blog/post-a",
				"visitor-2",
			),
			env.D1.prepare("INSERT INTO page_details (slug, view_count, likes) VALUES (?, 0, 0)").bind(
				"/blog/post-a",
			),
		]);

		const result = await incrementLikes(db, "/blog/post-a", "visitor-3");

		expect(result.likes).toBe(3);
		expect(await storedLikes("/blog/post-a")).toBe(3);
	});

	it("keeps likes scoped to their slug", async () => {
		await incrementLikes(db, "/blog/post-a", "visitor-1");
		await incrementLikes(db, "/blog/post-b", "visitor-1");
		await incrementLikes(db, "/blog/post-b", "visitor-2");

		expect(await storedLikes("/blog/post-a")).toBe(1);
		expect(await storedLikes("/blog/post-b")).toBe(2);
	});
});
