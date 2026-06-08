import { createServerFn } from "@tanstack/react-start";

import { getDb } from "@/db";
import { getPageViews, upsertPageViews } from "@/lib/domains/PageViews";
import { normalizePathname } from "@/lib/helpers/utils";

import { type PagePathnamePayload, validatePagePathnamePayload } from "./pageInteraction.serverFns";

export type PageViewCount = {
	view_count: number;
};

type ViewCountDeps<TDb> = {
	getDb: () => TDb;
	getPageViews: (db: TDb, slug: string) => Promise<PageViewCount>;
	upsertPageViews: (db: TDb, slug: string) => Promise<PageViewCount>;
};

const defaultViewCountDeps = {
	getDb,
	getPageViews,
	upsertPageViews,
};

export const fetchViewCountServerFn = createServerFn({
	method: "GET",
})
	.validator((data) => {
		return validatePagePathnamePayload(data, "Invalid page views payload");
	})
	.handler(async ({ data }) => {
		return fetchViewCount(data);
	});

export async function fetchViewCount(data: PagePathnamePayload): Promise<PageViewCount>;
export async function fetchViewCount<TDb>(
	data: PagePathnamePayload,
	deps: ViewCountDeps<TDb>,
): Promise<PageViewCount>;
export async function fetchViewCount<TDb>(
	data: PagePathnamePayload,
	deps?: ViewCountDeps<TDb>,
): Promise<PageViewCount> {
	const normalizedSlug = normalizePathname(data.slug);

	try {
		if (deps) {
			const db = deps.getDb();
			if (data.disabled) {
				return await deps.getPageViews(db, normalizedSlug);
			}
			return await deps.upsertPageViews(db, normalizedSlug);
		}

		const db = defaultViewCountDeps.getDb();
		if (data.disabled) {
			return await defaultViewCountDeps.getPageViews(db, normalizedSlug);
		}
		return await defaultViewCountDeps.upsertPageViews(db, normalizedSlug);
	} catch {
		return { view_count: 0 };
	}
}
