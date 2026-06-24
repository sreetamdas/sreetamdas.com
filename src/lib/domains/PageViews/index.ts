/**
 * D1-backed page view and like counters. View writes stay atomic through an
 * upsert, while like writes use an SQL insert gate so the anonymous cookie
 * identity is deduped by visitor and abuse-capped by IP in the database.
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
	readOnly?: boolean;
};

export type IncrementLikeInput = {
	visitorHash: string;
	ipHash: string;
	saltVersion: number;
	abuseLimit: number;
};

export type DecrementLikeInput = {
	visitorHash: string;
	saltVersion: number;
};

export type PageViewsDb = BaseSQLiteDatabase<"sync" | "async", unknown, typeof schema>;
export type PageLikesDb = DrizzleD1Database<typeof schema> | PageViewsDb;

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
	saltVersion = 1,
): Promise<LikeCount> {
	const normalizedSlug = normalizePathname(slug);
	const [likeCount, visitorLike] = await Promise.all([
		getLikeCount(db, normalizedSlug),
		visitorHash
			? getVisitorLike(db, normalizedSlug, visitorHash, saltVersion)
			: Promise.resolve(false),
	]);

	return { likes: likeCount, hasLiked: visitorLike };
}

export async function incrementLikes(
	db: PageLikesDb,
	slug: string,
	input: IncrementLikeInput,
): Promise<LikeCount> {
	const normalizedSlug = normalizePathname(slug);
	const { visitorHash, ipHash, saltVersion, abuseLimit } = input;

	await db.run(sql`
		INSERT INTO post_likes (slug, visitor_hash, ip_hash, salt_version)
		SELECT ${normalizedSlug}, ${visitorHash}, ${ipHash}, ${saltVersion}
		WHERE (
			SELECT COUNT(*) FROM ${postLikes}
			WHERE ${postLikes.slug} = ${normalizedSlug}
				AND ${postLikes.ipHash} = ${ipHash}
				AND ${postLikes.saltVersion} = ${saltVersion}
		) < ${abuseLimit}
		ON CONFLICT DO NOTHING
	`);

	const [likes, hasLiked] = await Promise.all([
		syncLikeCount(db, normalizedSlug, saltVersion),
		getVisitorLike(db, normalizedSlug, visitorHash, saltVersion),
	]);

	return { likes, hasLiked };
}

export async function decrementLikes(
	db: PageLikesDb,
	slug: string,
	input: DecrementLikeInput,
): Promise<LikeCount> {
	const normalizedSlug = normalizePathname(slug);
	const { visitorHash, saltVersion } = input;

	await db.run(sql`
		DELETE FROM ${postLikes}
		WHERE ${postLikes.slug} = ${normalizedSlug}
			AND ${postLikes.visitorHash} = ${visitorHash}
			AND ${postLikes.saltVersion} = ${saltVersion}
	`);

	const [likes, hasLiked] = await Promise.all([
		syncLikeCount(db, normalizedSlug, saltVersion),
		getVisitorLike(db, normalizedSlug, visitorHash, saltVersion),
	]);

	return { likes, hasLiked };
}

async function syncLikeCount(
	db: PageLikesDb,
	normalizedSlug: string,
	saltVersion: number,
): Promise<number> {
	const likesFromVisitors = sql<number>`(SELECT COUNT(*) FROM ${postLikes} WHERE ${postLikes.slug} = ${normalizedSlug} AND ${postLikes.saltVersion} = ${saltVersion})`;
	const syncedRows = await db
		.insert(pageDetails)
		.values({ slug: normalizedSlug, viewCount: 0, likes: likesFromVisitors })
		.onConflictDoUpdate({
			target: pageDetails.slug,
			set: { likes: likesFromVisitors, updatedAt: sql`CURRENT_TIMESTAMP` },
		})
		.returning({ likes: pageDetails.likes });

	return syncedRows[0]?.likes ?? 0;
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
	saltVersion: number,
): Promise<boolean> {
	const rows = await db
		.select({ visitorHash: postLikes.visitorHash })
		.from(postLikes)
		.where(
			and(
				eq(postLikes.slug, slug),
				eq(postLikes.visitorHash, visitorHash),
				eq(postLikes.saltVersion, saltVersion),
			),
		)
		.limit(1);

	return rows.length > 0;
}
