import { createServerFn } from "@tanstack/react-start";
import { allBlogPosts } from "content-collections";

import { type LikeCount } from "@/lib/domains/PageViews";
import { normalizePathname } from "@/lib/helpers/utils";

import { type PagePathnamePayload, validatePagePathnamePayload } from "./shared";

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
	.handler(async (ctx) => {
		return fetchLikeCount(ctx.data, getClientIpFromServerFnContext(ctx));
	});

export const incrementLikeServerFn = createServerFn({
	method: "POST",
})
	.validator((data) => {
		return validatePagePathnamePayload(data, "Invalid likes payload");
	})
	.handler(async (ctx) => {
		return incrementLikeCount(ctx.data, getClientIpFromServerFnContext(ctx));
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
	} catch {
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
	} catch {
		return { likes: 0, hasLiked: false };
	}
}

function getClientIpFromServerFnContext(ctx: unknown): string | undefined {
	if (typeof ctx !== "object" || ctx === null) {
		return undefined;
	}

	const request = Reflect.get(ctx, "request");
	if (!(request instanceof Request)) {
		return undefined;
	}

	return request.headers.get("cf-connecting-ip") ?? undefined;
}

function isKnownBlogLikeSlug(slug: string) {
	return validBlogLikeSlugs.has(slug);
}
