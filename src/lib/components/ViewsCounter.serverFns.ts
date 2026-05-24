import { createServerFn } from "@tanstack/react-start";

import { getDb } from "@/db";
import { upsertPageViews } from "@/lib/domains/PageViews";

export type PageViewCount = {
	view_count: number;
};

type PagePathname = {
	slug: string;
	disabled: boolean;
};

type ViewCountDeps = {
	getDb: typeof getDb;
	upsertPageViews: typeof upsertPageViews;
};

const defaultViewCountDeps: ViewCountDeps = {
	getDb,
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
	deps: ViewCountDeps = defaultViewCountDeps,
) {
	const normalizedSlug = normalizePathname(data.slug);

	if (data.disabled) {
		return { view_count: 0 };
	}

	try {
		if (!env) {
			return { view_count: 0 };
		}

		const db = deps.getDb(env);

		return await deps.upsertPageViews(db, normalizedSlug);
	} catch {
		return { view_count: 0 };
	}
}

function validatePagePathname(data: unknown): PagePathname {
	if (typeof data !== "object" || data === null) {
		throw new Error("Invalid page views payload");
	}

	const { slug, disabled } = data as Record<string, unknown>;
	if (typeof slug !== "string" || slug.length === 0 || typeof disabled !== "boolean") {
		throw new Error("Invalid page views payload");
	}

	return { slug, disabled };
}

function normalizePathname(pathname: string) {
	if (pathname !== "/" && pathname.endsWith("/")) {
		return pathname.slice(0, -1);
	}

	return pathname;
}
