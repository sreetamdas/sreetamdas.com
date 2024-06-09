import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/domains/db";
import { page_details_table } from "@/lib/domains/db/schema";

export type PageViewCount = {
	view_count: number;
};

type SuccessResponse<Type = undefined> = { data: Type };
type ErrorResponse<Type = undefined> = {
	error?: Type;
};
export type PageViewCountResponse =
	| (SuccessResponse<PageViewCount> & ErrorResponse & { type: "success" })
	| (SuccessResponse<null> & ErrorResponse<{ message: string; cause: string }> & { type: "error" });

/**
 * Get page view_count
 * @param slug page slug
 * @returns Get page view_count
 */
export async function getPageViews(slug: string): Promise<PageViewCountResponse> {
	try {
		const [view_count] = await db
			.select({ view_count: page_details_table.view_count })
			.from(page_details_table)
			.where(eq(page_details_table.slug, slug))
			.limit(1);

		if (typeof view_count === "undefined") {
			throw new Error("Page has not been added to the database yet", {
				cause: { view_count: "undefined" },
			});
		}

		return { type: "success", data: view_count };
	} catch (error) {
		return {
			type: "error",
			// @ts-expect-error error shape
			error: { message: error.message, cause: error.cause },
			data: null,
		};
	}
}

/**
 * Upsert page view_count
 * @param slug page slug
 * @returns upserted page view_count after incrementing
 */
export async function upsertPageViews(slug: string): Promise<PageViewCountResponse> {
	try {
		const [{ view_count }] = await db
			.update(page_details_table)
			.set({
				view_count: sql`${page_details_table.view_count} + 1`,
			})
			.where(eq(page_details_table.slug, slug))
			.returning({ view_count: page_details_table.view_count });

		if (typeof view_count === "undefined") {
			throw new Error("Page has not been added to the database yet", {
				cause: { view_count: "undefined" },
			});
		}

		return { data: { view_count }, type: "success" };
	} catch (error) {
		return {
			type: "error",
			// @ts-expect-error error shape
			error: { message: error?.message, cause: error?.cause },
			data: null,
		};
	}
}
