import { createServerFn } from "@tanstack/react-start";

import { getDb } from "@/db";
import { getPageViews, upsertPageViews } from "@/lib/domains/PageViews";

export type PageViewCount = {
	view_count: number;
};

type PagePathname = {
	slug: string;
	disabled: boolean;
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
		return validatePagePathname(data);
	})
	.handler(async ({ data, context }) => {
		return fetchViewCount(data, context.env);
	});

export async function fetchViewCount(
	data: PagePathname,
	env: CloudflareEnv | undefined,
): Promise<PageViewCount>;
export async function fetchViewCount<TDb>(
	data: PagePathname,
	env: CloudflareEnv | undefined,
	deps: ViewCountDeps<TDb>,
): Promise<PageViewCount>;
export async function fetchViewCount<TDb>(
	data: PagePathname,
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

function validatePagePathname(data: unknown): PagePathname {
	if (!isPagePathnamePayload(data)) {
		throw new Error("Invalid page views payload");
	}

	return { slug: data.slug, disabled: data.disabled };
}

function isPagePathnamePayload(data: unknown): data is PagePathname {
	if (typeof data !== "object" || data === null) {
		return false;
	}

	if (!("slug" in data) || !("disabled" in data)) {
		return false;
	}

	return (
		typeof data.slug === "string" && data.slug.length > 0 && typeof data.disabled === "boolean"
	);
}

function normalizePathname(pathname: string) {
	if (pathname !== "/" && pathname.endsWith("/")) {
		return pathname.slice(0, -1);
	}

	return pathname;
}
