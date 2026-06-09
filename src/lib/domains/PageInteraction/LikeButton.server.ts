import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { allBlogPosts } from "content-collections";

import { type LikeCount } from "@/lib/domains/PageViews";
import { normalizePathname } from "@/lib/helpers/utils";

import {
	type PagePathnamePayload,
	validatePagePathnamePayload,
	warnCounterFailureOnce,
} from "./shared";

export type { LikeCount } from "@/lib/domains/PageViews";

const validBlogLikeSlugs = new Set(
	allBlogPosts.flatMap((post) => {
		if (!post.published) {
			return [];
		}

		return [normalizePathname(post.url ?? post.page_path)];
	}),
);
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

	if (!isKnownBlogLikeSlug(normalizedSlug)) {
		return { likes: 0, hasLiked: false };
	}

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

	if (!isKnownBlogLikeSlug(normalizedSlug)) {
		return { likes: 0, hasLiked: false };
	}

	try {
		const { incrementLikeCountInDb } = await import("./LikeButton.data.server");
		return await incrementLikeCountInDb(normalizedSlug, data.disabled, clientIp);
	} catch (error) {
		warnCounterFailureOnce("increment likes", error);
		return { likes: 0, hasLiked: false };
	}
}

function isKnownBlogLikeSlug(slug: string) {
	return validBlogLikeSlugs.has(slug);
}
