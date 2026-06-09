import "@tanstack/react-start/server-only";
import { getDb } from "@/db";
import { getPageViews, upsertPageViews } from "@/lib/domains/PageViews";

import type { PageViewCount } from "./ViewsCounter.server";

export async function fetchViewCountFromDb(
	normalizedSlug: string,
	disabled?: boolean,
): Promise<PageViewCount> {
	const db = getDb();
	if (disabled) {
		return await getPageViews(db, normalizedSlug);
	}
	return await upsertPageViews(db, normalizedSlug);
}
