import { createServerFn } from "@tanstack/react-start";
import { allBlogPosts } from "content-collections";

import { IS_DEV } from "@/config";
import { getDb } from "@/db";
import { getLikes, incrementLikes, type LikeCount } from "@/lib/domains/PageViews";
import { normalizePathname } from "@/lib/helpers/utils";

import { type PagePathnamePayload, validatePagePathnamePayload } from "./pageInteraction.serverFns";

export type { LikeCount } from "@/lib/domains/PageViews";

type LikeCountDeps<TDb> = {
	getDb: (env: CloudflareEnv | undefined) => TDb;
	getLikes: (db: TDb, slug: string, visitorHash?: string) => Promise<LikeCount>;
	incrementLikes: (db: TDb, slug: string, visitorHash: string) => Promise<LikeCount>;
	getVisitorHash: (
		env: CloudflareEnv | undefined,
		normalizedSlug: string,
		clientIp?: string,
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
let warnedAboutMissingLikesSalt = false;

export const fetchLikeCountServerFn = createServerFn({
	method: "GET",
})
	.inputValidator((data) => {
		return validatePagePathnamePayload(data, "Invalid likes payload");
	})
	.handler(async (ctx) => {
		return fetchLikeCount(
			ctx.data,
			ctx.context.env,
			undefined,
			getClientIpFromServerFnContext(ctx),
		);
	});

export const incrementLikeServerFn = createServerFn({
	method: "POST",
})
	.inputValidator((data) => {
		return validatePagePathnamePayload(data, "Invalid likes payload");
	})
	.handler(async (ctx) => {
		return incrementLikeCount(
			ctx.data,
			ctx.context.env,
			undefined,
			getClientIpFromServerFnContext(ctx),
		);
	});

export async function fetchLikeCount(
	data: PagePathnamePayload,
	env: CloudflareEnv | undefined,
): Promise<LikeCount>;
export async function fetchLikeCount(
	data: PagePathnamePayload,
	env: CloudflareEnv | undefined,
	deps: undefined,
	clientIp?: string,
): Promise<LikeCount>;
export async function fetchLikeCount<TDb>(
	data: PagePathnamePayload,
	env: CloudflareEnv | undefined,
	deps: LikeCountDeps<TDb>,
): Promise<LikeCount>;
export async function fetchLikeCount<TDb>(
	data: PagePathnamePayload,
	env: CloudflareEnv | undefined,
	deps?: LikeCountDeps<TDb>,
	clientIp?: string,
): Promise<LikeCount> {
	const normalizedSlug = normalizePathname(data.slug);

	if (!isKnownBlogLikeSlug(normalizedSlug)) {
		return { likes: 0, hasLiked: false };
	}

	try {
		if (deps) {
			const db = deps.getDb(env);
			const visitorHash = await deps.getVisitorHash(env, normalizedSlug, clientIp);
			return await deps.getLikes(db, normalizedSlug, visitorHash);
		}

		if (!env) {
			return { likes: 0, hasLiked: false };
		}

		const db = defaultLikeCountDeps.getDb(env);
		const visitorHash = await defaultLikeCountDeps.getVisitorHash(env, normalizedSlug, clientIp);
		return await defaultLikeCountDeps.getLikes(db, normalizedSlug, visitorHash);
	} catch {
		return { likes: 0, hasLiked: false };
	}
}

export async function incrementLikeCount(
	data: PagePathnamePayload,
	env: CloudflareEnv | undefined,
): Promise<LikeCount>;
export async function incrementLikeCount(
	data: PagePathnamePayload,
	env: CloudflareEnv | undefined,
	deps: undefined,
	clientIp?: string,
): Promise<LikeCount>;
export async function incrementLikeCount<TDb>(
	data: PagePathnamePayload,
	env: CloudflareEnv | undefined,
	deps: LikeCountDeps<TDb>,
): Promise<LikeCount>;
export async function incrementLikeCount<TDb>(
	data: PagePathnamePayload,
	env: CloudflareEnv | undefined,
	deps?: LikeCountDeps<TDb>,
	clientIp?: string,
): Promise<LikeCount> {
	const normalizedSlug = normalizePathname(data.slug);

	if (!isKnownBlogLikeSlug(normalizedSlug)) {
		return { likes: 0, hasLiked: false };
	}

	if (deps) {
		const db = deps.getDb(env);
		const visitorHash = await deps.getVisitorHash(env, normalizedSlug, clientIp);
		if (data.disabled || !visitorHash) {
			return await deps.getLikes(db, normalizedSlug, visitorHash);
		}
		return await deps.incrementLikes(db, normalizedSlug, visitorHash);
	}

	if (!env) {
		return { likes: 0, hasLiked: false };
	}

	const db = defaultLikeCountDeps.getDb(env);
	const visitorHash = await defaultLikeCountDeps.getVisitorHash(env, normalizedSlug, clientIp);
	if (data.disabled || !visitorHash) {
		return await defaultLikeCountDeps.getLikes(db, normalizedSlug, visitorHash);
	}
	return await defaultLikeCountDeps.incrementLikes(db, normalizedSlug, visitorHash);
}

async function getVisitorHash(
	env: CloudflareEnv | undefined,
	normalizedSlug: string,
	clientIp?: string,
): Promise<string | undefined> {
	const salt = env?.LIKES_IP_SALT;
	const ip = clientIp;
	if (!salt || !ip) {
		if (!salt && !IS_DEV && !warnedAboutMissingLikesSalt) {
			warnedAboutMissingLikesSalt = true;
			// oxlint-disable-next-line no-console
			console.warn("LIKES_IP_SALT is not configured; blog likes are read-only.");
		}
		return undefined;
	}

	const bytes = new TextEncoder().encode(`${salt}:${normalizedSlug}:${ip}`);
	const hash = await crypto.subtle.digest("SHA-256", bytes);

	return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
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
