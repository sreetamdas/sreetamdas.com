/**
 * Client-readable page view count. Read-only by design: the increment must not
 * live on a client-callable server fn — that was replayable by any HTTP client
 * (`Origin` spoofing defeats the CSRF middleware) and inflated counters. The
 * view *write* now happens server-side on the Worker document-request path with
 * per-visitor dedup. Here `disabled` is accepted to preserve the shared
 * page-interaction payload/validator contract but is intentionally ignored on
 * the view path; it still gates the like path.
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
