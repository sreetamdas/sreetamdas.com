import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

import { type LikeCount } from "@/lib/domains/PageViews";
import { normalizePathname } from "@/lib/helpers/utils";

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
		return fetchLikeCount(data, getRequestHeader("cf-connecting-ip"));
	});

export const incrementLikeServerFn = createServerFn({
	method: "POST",
})
	.validator((data) => {
		return validatePagePathnamePayload(data, "Invalid likes payload");
	})
	.handler(async ({ data }) => {
		return incrementLikeCount(data, getRequestHeader("cf-connecting-ip"));
	});

export async function fetchLikeCount(
	data: PagePathnamePayload,
	clientIp?: string,
): Promise<LikeCount> {
	const normalizedSlug = normalizePathname(data.slug);

	try {
		const { fetchLikeCountFromDb } = await import("./LikeButton.data.server");
		return await fetchLikeCountFromDb(normalizedSlug, clientIp);
	} catch (error) {
		warnCounterFailureOnce("fetch likes", error);
		return { likes: 0, hasLiked: false };
	}
}

export async function incrementLikeCount(
	data: PagePathnamePayload,
	clientIp?: string,
): Promise<LikeCount> {
	const normalizedSlug = normalizePathname(data.slug);

	try {
		const { incrementLikeCountInDb } = await import("./LikeButton.data.server");
		return await incrementLikeCountInDb(normalizedSlug, data.disabled, clientIp);
	} catch (error) {
		// Unlike the read path, a failed write must not fail open: returning a
		// success-shaped zero would silently drop the like (and reset the UI to
		// 0). Throw so the client mutation rolls back and re-enables retry.
		warnCounterFailureOnce("increment likes", error);
		throw error;
	}
}
