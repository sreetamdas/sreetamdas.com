/**
 * Client-readable page view count, read-only by design. Hydrated pages write
 * separately through ViewRecorder.server.ts: server origin/content/bot checks
 * and approximate edge replay/rate budgets run before the D1 increment.
 * `disabled` is intentionally ignored on this read-only path.
 */
import "@tanstack/react-start/server-only";
import { getDb } from "@/db";
import { getPageViews } from "@/lib/domains/PageViews";

import type { PageViewCount } from "./ViewsCounter.server";

export async function fetchViewCountFromDb(
	normalizedSlug: string,
	_disabled?: boolean,
): Promise<PageViewCount> {
	const db = getDb();
	return await getPageViews(db, normalizedSlug);
}
