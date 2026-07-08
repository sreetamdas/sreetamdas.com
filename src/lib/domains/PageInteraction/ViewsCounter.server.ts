import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

import { normalizePathname } from "@/lib/helpers/utils";

import {
	type PagePathnamePayload,
	validatePagePathnamePayload,
	warnCounterFailureOnce,
} from "./shared";

export type PageViewCount = {
	view_count: number;
};

export const fetchViewCountServerFn = createServerFn({
	method: "GET",
})
	.validator((data) => {
		return validatePagePathnamePayload(data, "Invalid page views payload");
	})
	.handler(async ({ data }) => {
		// Live counter: keep this read out of the Worker response cache
		// (cache.enabled) so the displayed count isn't served stale.
		setResponseHeader("Cache-Control", "no-store");
		return fetchViewCount(data);
	});

const fetchViewCountFromDbServer = createServerOnlyFn(
	async (normalizedSlug: string, disabled?: boolean): Promise<PageViewCount> => {
		const { fetchViewCountFromDb } = await import("./ViewsCounter.data.server");
		return await fetchViewCountFromDb(normalizedSlug, disabled);
	},
);

export async function fetchViewCount(data: PagePathnamePayload): Promise<PageViewCount> {
	const normalizedSlug = normalizePathname(data.slug);

	try {
		return await fetchViewCountFromDbServer(normalizedSlug, data.disabled);
	} catch (error) {
		warnCounterFailureOnce("fetch views", error);
		return { view_count: 0 };
	}
}
