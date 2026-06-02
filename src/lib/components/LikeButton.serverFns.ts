import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { allBlogPosts } from "content-collections";

import { getDb } from "@/db";
import { getLikes, incrementLikes, type LikeCount } from "@/lib/domains/PageViews";
import { normalizePathname } from "@/lib/helpers/utils";

export type { LikeCount } from "@/lib/domains/PageViews";

type PagePathname = {
	slug: string;
	disabled: boolean;
};

type LikeCountDeps<TDb> = {
	getDb: (env: CloudflareEnv | undefined) => TDb;
	getLikes: (db: TDb, slug: string, visitorHash?: string) => Promise<LikeCount>;
	incrementLikes: (db: TDb, slug: string, visitorHash: string) => Promise<LikeCount>;
	getVisitorHash: (
		env: CloudflareEnv | undefined,
		normalizedSlug: string,
	) => Promise<string | undefined>;
};

const defaultLikeCountDeps = {
	getDb,
	getLikes,
	incrementLikes,
	getVisitorHash,
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
		return validatePagePathname(data);
	})
	.handler(async ({ data, context }) => {
		return fetchLikeCount(data, context.env);
	});

export const incrementLikeServerFn = createServerFn({
	method: "POST",
})
	.inputValidator((data) => {
		return validatePagePathname(data);
	})
	.handler(async ({ data, context }) => {
		return incrementLikeCount(data, context.env);
	});

export async function fetchLikeCount(
	data: PagePathname,
	env: CloudflareEnv | undefined,
): Promise<LikeCount>;
export async function fetchLikeCount<TDb>(
	data: PagePathname,
	env: CloudflareEnv | undefined,
	deps: LikeCountDeps<TDb>,
): Promise<LikeCount>;
export async function fetchLikeCount<TDb>(
	data: PagePathname,
	env: CloudflareEnv | undefined,
	deps?: LikeCountDeps<TDb>,
): Promise<LikeCount> {
	const normalizedSlug = normalizePathname(data.slug);

	if (!isKnownBlogLikeSlug(normalizedSlug)) {
		return { likes: 0, hasLiked: false };
	}

	try {
		if (deps) {
			const db = deps.getDb(env);
			const visitorHash = await deps.getVisitorHash(env, normalizedSlug);
			return await deps.getLikes(db, normalizedSlug, visitorHash);
		}

		if (!env) {
			return { likes: 0, hasLiked: false };
		}

		const db = defaultLikeCountDeps.getDb(env);
		const visitorHash = await defaultLikeCountDeps.getVisitorHash(env, normalizedSlug);
		return await defaultLikeCountDeps.getLikes(db, normalizedSlug, visitorHash);
	} catch {
		return { likes: 0, hasLiked: false };
	}
}

export async function incrementLikeCount(
	data: PagePathname,
	env: CloudflareEnv | undefined,
): Promise<LikeCount>;
export async function incrementLikeCount<TDb>(
	data: PagePathname,
	env: CloudflareEnv | undefined,
	deps: LikeCountDeps<TDb>,
): Promise<LikeCount>;
export async function incrementLikeCount<TDb>(
	data: PagePathname,
	env: CloudflareEnv | undefined,
	deps?: LikeCountDeps<TDb>,
): Promise<LikeCount> {
	const normalizedSlug = normalizePathname(data.slug);

	if (!isKnownBlogLikeSlug(normalizedSlug)) {
		return { likes: 0, hasLiked: false };
	}

	if (deps) {
		const db = deps.getDb(env);
		const visitorHash = await deps.getVisitorHash(env, normalizedSlug);
		if (data.disabled || !visitorHash) {
			return await deps.getLikes(db, normalizedSlug, visitorHash);
		}
		return await deps.incrementLikes(db, normalizedSlug, visitorHash);
	}

	if (!env) {
		return { likes: 0, hasLiked: false };
	}

	const db = defaultLikeCountDeps.getDb(env);
	const visitorHash = await defaultLikeCountDeps.getVisitorHash(env, normalizedSlug);
	if (data.disabled || !visitorHash) {
		return await defaultLikeCountDeps.getLikes(db, normalizedSlug, visitorHash);
	}
	return await defaultLikeCountDeps.incrementLikes(db, normalizedSlug, visitorHash);
}

async function getVisitorHash(
	env: CloudflareEnv | undefined,
	normalizedSlug: string,
): Promise<string | undefined> {
	const salt = env?.LIKES_IP_SALT;
	const ip = getClientIp();
	if (!salt || !ip) {
		return undefined;
	}

	const bytes = new TextEncoder().encode(`${salt}:${normalizedSlug}:${ip}`);
	const hash = await crypto.subtle.digest("SHA-256", bytes);

	return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getClientIp(): string | undefined {
	try {
		return getRequest().headers.get("cf-connecting-ip") ?? undefined;
	} catch {
		return undefined;
	}
}

function isKnownBlogLikeSlug(slug: string) {
	return validBlogLikeSlugs.has(slug);
}

function validatePagePathname(data: unknown): PagePathname {
	if (!isPagePathnamePayload(data)) {
		throw new Error("Invalid likes payload");
	}

	return { slug: data.slug, disabled: data.disabled };
}

function isPagePathnamePayload(data: unknown): data is PagePathname {
	if (typeof data !== "object" || data === null) {
		return false;
	}

	if (!("slug" in data) || !("disabled" in data)) {
		return false;
	}

	return (
		typeof data.slug === "string" && data.slug.length > 0 && typeof data.disabled === "boolean"
	);
}
