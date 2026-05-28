/**
 * D1-backed page view counters. Reads are strict so missing seed data is visible,
 * while writes use an upsert/increment to keep concurrent page views atomic at
 * the database layer.
 */
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

import { eq, sql } from "drizzle-orm";

import * as schema from "@/db/schema";
import { pageDetails } from "@/db/schema";

export type PageViewCount = {
	view_count: number;
};

export type PageViewsDb = BaseSQLiteDatabase<"sync" | "async", unknown, typeof schema>;

export async function getPageViews(db: PageViewsDb, slug: string): Promise<PageViewCount> {
	const rows = await db
		.select({ view_count: pageDetails.viewCount })
		.from(pageDetails)
		.where(eq(pageDetails.slug, slug))
		.limit(1);

	const row = rows[0];
	if (!row) {
		throw new Error("Page has not been added to the database yet", {
			cause: { slug },
		});
	}

	return row;
}

export async function upsertPageViews(db: PageViewsDb, slug: string): Promise<PageViewCount> {
	const rows = await db
		.insert(pageDetails)
		.values({ slug, viewCount: 1, likes: 0 })
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
