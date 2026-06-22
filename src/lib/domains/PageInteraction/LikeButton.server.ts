import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setCookie } from "@tanstack/react-start/server";

import { type LikeCount } from "@/lib/domains/PageViews";
import { normalizePathname } from "@/lib/helpers/utils";

import {
	LIKE_ID_COOKIE_MAX_AGE_SECONDS,
	LIKE_ID_COOKIE_NAME,
	type LikeRequestContext,
} from "./LikeIdentity";
import {
	type PagePathnamePayload,
	validatePagePathnamePayload,
	warnCounterFailureOnce,
} from "./shared";

export type { LikeCount } from "@/lib/domains/PageViews";
export const fetchLikeCountServerFn = createServerFn({
	method: "GET",
})
	.validator((data) => {
		return validatePagePathnamePayload(data, "Invalid likes payload");
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

		return fetchLikeCount(data, context);
	});

export const incrementLikeServerFn = createServerFn({
	method: "POST",
})
	.validator((data) => {
		return validatePagePathnamePayload(data, "Invalid likes payload");
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

		return incrementLikeCount(data, context);
	});

export async function fetchLikeCount(
	data: PagePathnamePayload,
	context: LikeRequestContext = {},
): Promise<LikeCount> {
	const normalizedSlug = normalizePathname(data.slug);

	try {
		const { fetchLikeCountFromDb } = await import("./LikeButton.data.server");
		return await fetchLikeCountFromDb(normalizedSlug, context);
	} catch (error) {
		warnCounterFailureOnce("fetch likes", error);
		return { likes: 0, hasLiked: false };
	}
}

export async function incrementLikeCount(
	data: PagePathnamePayload,
	context: LikeRequestContext = {},
): Promise<LikeCount> {
	const normalizedSlug = normalizePathname(data.slug);

	try {
		const { incrementLikeCountInDb } = await import("./LikeButton.data.server");
		return await incrementLikeCountInDb(normalizedSlug, data.disabled, context);
	} catch (error) {
		// Unlike the read path, a failed write must not fail open: returning a
		// success-shaped zero would silently drop the like (and reset the UI to
		// 0). Throw so the client mutation rolls back and re-enables retry.
		warnCounterFailureOnce("increment likes", error);
		throw error;
	}
}
