import { createServerFn } from "@tanstack/react-start";
import { allBlogPosts } from "content-collections";

import { type LikeCount } from "@/lib/domains/PageViews";
import { normalizePathname } from "@/lib/helpers/utils";

import { type PagePathnamePayload, validatePagePathnamePayload } from "./pageInteraction.server";

export type { LikeCount } from "@/lib/domains/PageViews";

type LikeCountDeps<TDb> = {
	getDb: () => TDb;
	getLikes: (db: TDb, slug: string, visitorHash?: string) => Promise<LikeCount>;
	incrementLikes: (db: TDb, slug: string, visitorHash: string) => Promise<LikeCount>;
	getVisitorHash: (normalizedSlug: string, clientIp?: string) => Promise<string | undefined>;
};

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
	.inputValidator((data) => {
		return validatePagePathnamePayload(data, "Invalid likes payload");
	})
	.handler(async (ctx) => {
		return fetchLikeCount(ctx.data, undefined, getClientIpFromServerFnContext(ctx));
	});

export const incrementLikeServerFn = createServerFn({
	method: "POST",
})
	.inputValidator((data) => {
		return validatePagePathnamePayload(data, "Invalid likes payload");
	})
	.handler(async (ctx) => {
		return incrementLikeCount(ctx.data, undefined, getClientIpFromServerFnContext(ctx));
	});

export async function fetchLikeCount(data: PagePathnamePayload): Promise<LikeCount>;
export async function fetchLikeCount(
	data: PagePathnamePayload,
	deps: undefined,
	clientIp?: string,
): Promise<LikeCount>;
export async function fetchLikeCount<TDb>(
	data: PagePathnamePayload,
	deps: LikeCountDeps<TDb>,
): Promise<LikeCount>;
export async function fetchLikeCount<TDb>(
	data: PagePathnamePayload,
	deps?: LikeCountDeps<TDb>,
	clientIp?: string,
): Promise<LikeCount> {
	const normalizedSlug = normalizePathname(data.slug);

	if (!isKnownBlogLikeSlug(normalizedSlug)) {
		return { likes: 0, hasLiked: false };
	}

	try {
		if (deps) {
			const db = deps.getDb();
			const visitorHash = await deps.getVisitorHash(normalizedSlug, clientIp);
			return await deps.getLikes(db, normalizedSlug, visitorHash);
		}

		const { fetchLikeCountFromDb } = await import("./LikeButton.data.server");
		return await fetchLikeCountFromDb(normalizedSlug, clientIp);
	} catch {
		return { likes: 0, hasLiked: false };
	}
}

export async function incrementLikeCount(data: PagePathnamePayload): Promise<LikeCount>;
export async function incrementLikeCount(
	data: PagePathnamePayload,
	deps: undefined,
	clientIp?: string,
): Promise<LikeCount>;
export async function incrementLikeCount<TDb>(
	data: PagePathnamePayload,
	deps: LikeCountDeps<TDb>,
): Promise<LikeCount>;
export async function incrementLikeCount<TDb>(
	data: PagePathnamePayload,
	deps?: LikeCountDeps<TDb>,
	clientIp?: string,
): Promise<LikeCount> {
	const normalizedSlug = normalizePathname(data.slug);

	if (!isKnownBlogLikeSlug(normalizedSlug)) {
		return { likes: 0, hasLiked: false };
	}

	if (deps) {
		const db = deps.getDb();
		const visitorHash = await deps.getVisitorHash(normalizedSlug, clientIp);
		if (data.disabled || !visitorHash) {
			return await deps.getLikes(db, normalizedSlug, visitorHash);
		}
		return await deps.incrementLikes(db, normalizedSlug, visitorHash);
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
