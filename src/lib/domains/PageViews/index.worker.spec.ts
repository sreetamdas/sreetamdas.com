/*
Real-D1 coverage for the likes insert gate. The unit test runs against a
synchronous better-sqlite3 double, so it cannot prove that SQLite accepts the
same INSERT ... SELECT ... ON CONFLICT statement under workerd's D1 runtime.
*/

import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { beforeEach, describe, expect, it } from "vitest";

import * as schema from "@/db/schema";
import { pageDetails } from "@/db/schema";

import type { IncrementLikeInput } from "./index";

import { incrementLikes } from "./index";

const SCHEMA_STATEMENTS = [
	"DROP TABLE IF EXISTS post_likes",
	"DROP TABLE IF EXISTS page_details",
	"CREATE TABLE page_details (id integer PRIMARY KEY AUTOINCREMENT, slug text NOT NULL, view_count integer DEFAULT 0 NOT NULL, likes integer DEFAULT 0 NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, CHECK (view_count >= 0), CHECK (likes >= 0))",
	"CREATE UNIQUE INDEX page_details_slug_unique ON page_details (slug)",
	"CREATE TABLE post_likes (slug text NOT NULL, visitor_hash text NOT NULL, ip_hash text, salt_version integer DEFAULT 1 NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)",
	"CREATE UNIQUE INDEX post_likes_slug_visitor_hash_salt_version_unique ON post_likes (slug, visitor_hash, salt_version)",
	"CREATE INDEX post_likes_slug_ip_hash_salt_version_idx ON post_likes (slug, ip_hash, salt_version)",
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

describe("incrementLikes (real D1)", () => {
	beforeEach(async () => {
		for (const statement of SCHEMA_STATEMENTS) {
			await env.D1.prepare(statement).run();
		}
	});

	it("records the visitor like and derives the public counter", async () => {
		const result = await incrementLikes(db, "/blog/post-a", likeInput("visitor-1", "ip-1"));

		expect(result).toEqual({ likes: 1, hasLiked: true });
		expect(await storedLikes("/blog/post-a")).toBe(1);
	});

	it("is idempotent for a repeated cookie visitor", async () => {
		await incrementLikes(db, "/blog/post-a", likeInput("visitor-1", "ip-1"));
		const result = await incrementLikes(db, "/blog/post-a", likeInput("visitor-1", "ip-2"));

		expect(result).toEqual({ likes: 1, hasLiked: true });
		expect(await storedLikes("/blog/post-a")).toBe(1);
	});

	it("counts distinct cookie visitors from the same ip while under the ceiling", async () => {
		await incrementLikes(db, "/blog/post-a", likeInput("visitor-1", "ip-1"));
		const result = await incrementLikes(db, "/blog/post-a", likeInput("visitor-2", "ip-1"));

		expect(result.likes).toBe(2);
		expect(result.hasLiked).toBe(true);
		expect(await storedLikes("/blog/post-a")).toBe(2);
	});

	it("returns the current unliked state when the ip abuse ceiling is reached", async () => {
		await incrementLikes(db, "/blog/post-a", likeInput("visitor-1", "ip-1", 1, 2));
		await incrementLikes(db, "/blog/post-a", likeInput("visitor-2", "ip-1", 1, 2));
		const result = await incrementLikes(db, "/blog/post-a", likeInput("visitor-3", "ip-1", 1, 2));

		expect(result).toEqual({ likes: 2, hasLiked: false });
		expect(await storedLikes("/blog/post-a")).toBe(2);
	});

	it("keeps the ip abuse ceiling scoped to a slug and ip hash", async () => {
		await incrementLikes(db, "/blog/post-a", likeInput("visitor-1", "ip-1", 1, 1));
		const secondIp = await incrementLikes(db, "/blog/post-a", likeInput("visitor-2", "ip-2", 1, 1));
		const secondSlug = await incrementLikes(
			db,
			"/blog/post-b",
			likeInput("visitor-3", "ip-1", 1, 1),
		);

		expect(secondIp).toEqual({ likes: 2, hasLiked: true });
		expect(secondSlug).toEqual({ likes: 1, hasLiked: true });
	});

	it("repairs a stale public counter from recorded visitor likes", async () => {
		await env.D1.batch([
			env.D1.prepare("INSERT INTO post_likes (slug, visitor_hash, ip_hash) VALUES (?, ?, ?)").bind(
				"/blog/post-a",
				"visitor-1",
				"ip-1",
			),
			env.D1.prepare("INSERT INTO post_likes (slug, visitor_hash, ip_hash) VALUES (?, ?, ?)").bind(
				"/blog/post-a",
				"visitor-2",
				"ip-2",
			),
			env.D1.prepare("INSERT INTO page_details (slug, view_count, likes) VALUES (?, 0, 0)").bind(
				"/blog/post-a",
			),
		]);

		const result = await incrementLikes(db, "/blog/post-a", likeInput("visitor-3", "ip-3"));

		expect(result.likes).toBe(3);
		expect(await storedLikes("/blog/post-a")).toBe(3);
	});

	it("excludes prior salt-version rows from the recomputed counter", async () => {
		await env.D1.prepare(
			"INSERT INTO post_likes (slug, visitor_hash, ip_hash, salt_version) VALUES (?, ?, ?, 1)",
		)
			.bind("/blog/post-a", "old-era", "ip-1")
			.run();

		const result = await incrementLikes(db, "/blog/post-a", likeInput("new-era", "ip-1", 2));

		expect(result.likes).toBe(1);
		expect(await storedLikes("/blog/post-a")).toBe(1);
	});
});

function likeInput(
	visitorHash: string,
	ipHash: string,
	saltVersion = 1,
	abuseLimit = 10,
): IncrementLikeInput {
	return { visitorHash, ipHash, saltVersion, abuseLimit };
}
