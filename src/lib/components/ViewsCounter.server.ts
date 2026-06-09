import { createServerFn } from "@tanstack/react-start";

import { normalizePathname } from "@/lib/helpers/utils";

import { type PagePathnamePayload, validatePagePathnamePayload } from "./pageInteraction.server";

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
		return fetchViewCount(data);
	});

export async function fetchViewCount(data: PagePathnamePayload): Promise<PageViewCount> {
	const normalizedSlug = normalizePathname(data.slug);

	try {
		const { fetchViewCountFromDb } = await import("./ViewsCounter.data.server");
		return await fetchViewCountFromDb(normalizedSlug, data.disabled);
	} catch {
		return { view_count: 0 };
	}
}
