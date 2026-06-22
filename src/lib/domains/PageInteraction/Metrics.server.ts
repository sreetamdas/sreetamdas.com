import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setCookie } from "@tanstack/react-start/server";

import { type LikeCount } from "@/lib/domains/PageViews";

import { fetchLikeCount } from "./LikeButton.server";
import {
	LIKE_ID_COOKIE_MAX_AGE_SECONDS,
	LIKE_ID_COOKIE_NAME,
	type LikeRequestContext,
} from "./LikeIdentity";
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
		const clientIp = getRequestHeader("cf-connecting-ip");
		const cookieHeader = getRequestHeader("cookie");
		const context: LikeRequestContext = {
			setLikeCookie: (cookieValue) => {
				setCookie(LIKE_ID_COOKIE_NAME, cookieValue, {
					httpOnly: true,
					secure: true,
					sameSite: "lax",
					path: "/",
					maxAge: LIKE_ID_COOKIE_MAX_AGE_SECONDS,
				});
			},
		};
		if (clientIp) {
			context.clientIp = clientIp;
		}
		if (cookieHeader) {
			context.cookieHeader = cookieHeader;
		}

		return fetchPageMetrics(data, context);
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
