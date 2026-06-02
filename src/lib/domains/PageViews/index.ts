/**
 * D1-backed page view counters. Reads are strict so missing seed data is visible,
 * while writes use an upsert/increment to keep concurrent page views atomic at
 * the database layer.
 */
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

import { and, eq, sql } from "drizzle-orm";

import * as schema from "@/db/schema";
import { pageDetails, postLikes } from "@/db/schema";
import { normalizePathname } from "@/lib/helpers/utils";

export type PageViewCount = {
	view_count: number;
};

export type LikeCount = {
	likes: number;
	hasLiked: boolean;
};

export type PageViewsDb = BaseSQLiteDatabase<"sync" | "async", unknown, typeof schema>;

type PageLikesDb = DrizzleD1Database<typeof schema>;

export async function getPageViews(db: PageViewsDb, slug: string): Promise<PageViewCount> {
	const normalizedSlug = normalizePathname(slug);
	const rows = await db
		.select({ view_count: pageDetails.viewCount })
		.from(pageDetails)
		.where(eq(pageDetails.slug, normalizedSlug))
		.limit(1);

	const row = rows[0];
	if (!row) {
		throw new Error("Page has not been added to the database yet", {
			cause: { slug: normalizedSlug },
		});
	}

	return row;
}

export async function upsertPageViews(db: PageViewsDb, slug: string): Promise<PageViewCount> {
	const normalizedSlug = normalizePathname(slug);
	const rows = await db
		.insert(pageDetails)
		.values({ slug: normalizedSlug, viewCount: 1, likes: 0 })
		.onConflictDoUpdate({
			target: pageDetails.slug,
			set: {
				viewCount: sql`${pageDetails.viewCount} + 1`,
				updatedAt: sql`CURRENT_TIMESTAMP`,
			},
		})
		.returning({ view_count: pageDetails.viewCount });

	const row = rows[0];
	if (!row) {
		throw new Error("Failed to upsert page view");
	}

	return row;
}

export async function getLikes(
	db: PageViewsDb,
	slug: string,
	visitorHash?: string,
): Promise<LikeCount> {
	const normalizedSlug = normalizePathname(slug);
	const [likeCount, visitorLike] = await Promise.all([
		getLikeCount(db, normalizedSlug),
		visitorHash ? getVisitorLike(db, normalizedSlug, visitorHash) : Promise.resolve(false),
	]);

	return { likes: likeCount, hasLiked: visitorLike };
}

export async function incrementLikes(
	db: PageLikesDb,
	slug: string,
	visitorHash: string,
): Promise<LikeCount> {
	const normalizedSlug = normalizePathname(slug);

	await db.batch([
		db.run(sql`
			INSERT OR IGNORE INTO post_likes (slug, visitor_hash)
			VALUES (${normalizedSlug}, ${visitorHash})
		`),
		db.run(sql`
			INSERT INTO page_details (slug, view_count, likes)
			SELECT ${normalizedSlug}, 0, 1
			WHERE changes() > 0
			ON CONFLICT(slug) DO UPDATE SET
				likes = likes + 1,
				updated_at = CURRENT_TIMESTAMP
		`),
	]);

	return getLikes(db, normalizedSlug, visitorHash);
}

async function getLikeCount(db: PageViewsDb, slug: string): Promise<number> {
	const rows = await db
		.select({ likes: pageDetails.likes })
		.from(pageDetails)
		.where(eq(pageDetails.slug, slug))
		.limit(1);

	return rows[0]?.likes ?? 0;
}

async function getVisitorLike(
	db: PageViewsDb,
	slug: string,
	visitorHash: string,
): Promise<boolean> {
	const rows = await db
		.select({ visitorHash: postLikes.visitorHash })
		.from(postLikes)
		.where(and(eq(postLikes.slug, slug), eq(postLikes.visitorHash, visitorHash)))
		.limit(1);

	return rows.length > 0;
}
