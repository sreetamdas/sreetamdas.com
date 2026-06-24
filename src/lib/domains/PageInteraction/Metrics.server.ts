import { createServerFn } from "@tanstack/react-start";

import { type LikeCount } from "@/lib/domains/PageViews";

import { fetchLikeCount } from "./LikeButton.server";
import { type LikeRequestContext } from "./LikeIdentity";
import { getLikeRequestContext } from "./LikeRequestContext.server";
import { type PagePathnamePayload, validatePagePathnamePayload } from "./shared";
import { fetchViewCount, type PageViewCount } from "./ViewsCounter.server";

export type PageMetrics = PageViewCount & LikeCount;

export const fetchPageMetricsServerFn = createServerFn({
	method: "GET",
})
	.validator((data) => {
		return validatePagePathnamePayload(data, "Invalid metrics payload");
	})
	.handler(async ({ data }) => {
		return fetchPageMetrics(data, getLikeRequestContext());
	});

// Views and likes are independent reads, so run them concurrently within the one
// request. The win over two separate client calls is a single round-trip and one
// Worker invocation (cold start), not fewer DB queries — each path keeps its own
// fail-open guard so a failure in one never takes down the other.
export async function fetchPageMetrics(
	data: PagePathnamePayload,
	context: LikeRequestContext = {},
): Promise<PageMetrics> {
	const [views, likes] = await Promise.all([fetchViewCount(data), fetchLikeCount(data, context)]);
	return { ...views, ...likes };
}
