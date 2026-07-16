/**
 * Server-function page view recorder.
 *
 * Cached HTML cannot reliably run Worker document hooks, so hydrated pages call
 * this same-origin TanStack server function once per pathname. Refreshes should
 * count as new page views, so the server path validates the slug and writes once
 * for each valid call instead of applying visitor dedupe.
 */
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";

import { normalizePathname } from "@/lib/helpers/utils";

import {
	type PagePathnamePayload,
	validatePagePathnamePayload,
	warnCounterFailureOnce,
} from "./shared";

const MAX_SLUG_LENGTH = 512;

type ViewWrite = (normalizedSlug: string) => Promise<void>;

export type PageViewRecordResult = {
	recorded: boolean;
};

export const recordPageViewServerFn = createServerFn({
	method: "POST",
})
	.validator((data) => {
		return validatePagePathnamePayload(data, "Invalid page view record payload");
	})
	.handler(async ({ data }) => {
		return await recordPageView(data, upsertPageViewInDb);
	});

export async function recordPageView(
	data: PagePathnamePayload,
	writeView: ViewWrite = upsertPageViewInDb,
): Promise<PageViewRecordResult> {
	const normalizedSlug = normalizeViewSlug(data.slug);
	if (data.disabled || !normalizedSlug) {
		return { recorded: false };
	}

	try {
		await writeView(normalizedSlug);
		return { recorded: true };
	} catch (error) {
		warnCounterFailureOnce("record page view", error);
		return { recorded: false };
	}
}

const upsertPageViewInDb = createServerOnlyFn(async (normalizedSlug: string): Promise<void> => {
	const { getDb } = await import("@/db");
	const { upsertPageViews } = await import("@/lib/domains/PageViews");
	await upsertPageViews(getDb(), normalizedSlug);
});

function normalizeViewSlug(slug: string): string | undefined {
	if (slug.length > MAX_SLUG_LENGTH || !slug.startsWith("/") || slug.startsWith("//")) {
		return undefined;
	}

	const url = new URL(slug, "https://sreetamdas.com");
	if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/assets/")) {
		return undefined;
	}

	return normalizePathname(url.pathname);
}
