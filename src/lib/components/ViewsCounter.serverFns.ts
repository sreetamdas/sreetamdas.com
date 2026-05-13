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

export const fetchViewCountServerFn = createServerFn<"GET", "data", PageViewCount>({
	method: "GET",
})
	.inputValidator((data) => {
		return validatePagePathname(data);
	})
	.handler(async ({ data }) => {
		const normalizedSlug = normalizePathname(data.slug);

		if (data.disabled) {
			return { view_count: 0 };
		}

		const workersModule = "cloudflare:workers";
		const { env } = await import(/* @vite-ignore */ workersModule);
		const db = getDb(env);

		return upsertPageViews(db, normalizedSlug);
	});

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
