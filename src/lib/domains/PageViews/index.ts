import { eq, sql } from "drizzle-orm";
import { pageDetails } from "@/db/schema";
import type { Db } from "@/db";

export type PageViewCount = {
	view_count: number;
};

export async function getPageViews(db: Db, slug: string): Promise<PageViewCount> {
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

export async function upsertPageViews(db: Db, slug: string): Promise<PageViewCount> {
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
