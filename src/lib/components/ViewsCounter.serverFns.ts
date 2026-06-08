import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";

import { getDb } from "@/db";
import { getPageViews, upsertPageViews } from "@/lib/domains/PageViews";
import { normalizePathname } from "@/lib/helpers/utils";

import { type PagePathnamePayload, validatePagePathnamePayload } from "./pageInteraction.serverFns";

export type PageViewCount = {
	view_count: number;
};

type ViewCountDeps<TDb> = {
	getDb: (env: CloudflareEnv | undefined) => TDb;
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
	.inputValidator((data) => {
		return validatePagePathnamePayload(data, "Invalid page views payload");
	})
	.handler(async ({ data }) => {
		return fetchViewCount(data, env);
	});

export async function fetchViewCount(
	data: PagePathnamePayload,
	env: CloudflareEnv | undefined,
): Promise<PageViewCount>;
export async function fetchViewCount<TDb>(
	data: PagePathnamePayload,
	env: CloudflareEnv | undefined,
	deps: ViewCountDeps<TDb>,
): Promise<PageViewCount>;
export async function fetchViewCount<TDb>(
	data: PagePathnamePayload,
	env: CloudflareEnv | undefined,
	deps?: ViewCountDeps<TDb>,
): Promise<PageViewCount> {
	const normalizedSlug = normalizePathname(data.slug);

	try {
		if (deps) {
			const db = deps.getDb(env);
			if (data.disabled) {
				return await deps.getPageViews(db, normalizedSlug);
			}
			return await deps.upsertPageViews(db, normalizedSlug);
		}

		if (!env) {
			return { view_count: 0 };
		}

		const db = defaultViewCountDeps.getDb(env);
		if (data.disabled) {
			return await defaultViewCountDeps.getPageViews(db, normalizedSlug);
		}
		return await defaultViewCountDeps.upsertPageViews(db, normalizedSlug);
	} catch {
		return { view_count: 0 };
	}
}
