import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";

import { type LikeCount } from "@/lib/domains/PageViews";
import { normalizePathname } from "@/lib/helpers/utils";

import { type LikeRequestContext } from "./LikeIdentity";
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
		return fetchLikeCount(data, await getLikeRequestContextServer());
	});

export const incrementLikeServerFn = createServerFn({
	method: "POST",
})
	.validator((data) => {
		return validatePagePathnamePayload(data, "Invalid likes payload");
	})
	.handler(async ({ data }) => {
		return incrementLikeCount(data, await getLikeRequestContextServer());
	});

export const decrementLikeServerFn = createServerFn({
	method: "POST",
})
	.validator((data) => {
		return validatePagePathnamePayload(data, "Invalid likes payload");
	})
	.handler(async ({ data }) => {
		return decrementLikeCount(data, await getLikeRequestContextServer());
	});

const getLikeRequestContextServer = createServerOnlyFn(async (): Promise<LikeRequestContext> => {
	const { getLikeRequestContext } = await import("./LikeRequestContext.server");
	return getLikeRequestContext();
});

const fetchLikeCountFromDbServer = createServerOnlyFn(
	async (normalizedSlug: string, context: LikeRequestContext): Promise<LikeCount> => {
		const { fetchLikeCountFromDb } = await import("./LikeButton.data.server");
		return await fetchLikeCountFromDb(normalizedSlug, context);
	},
);

const incrementLikeCountInDbServer = createServerOnlyFn(
	async (
		normalizedSlug: string,
		disabled: boolean | undefined,
		context: LikeRequestContext,
	): Promise<LikeCount> => {
		const { incrementLikeCountInDb } = await import("./LikeButton.data.server");
		return await incrementLikeCountInDb(normalizedSlug, disabled, context);
	},
);

const decrementLikeCountInDbServer = createServerOnlyFn(
	async (normalizedSlug: string, context: LikeRequestContext): Promise<LikeCount> => {
		const { decrementLikeCountInDb } = await import("./LikeButton.data.server");
		return await decrementLikeCountInDb(normalizedSlug, context);
	},
);

export async function fetchLikeCount(
	data: PagePathnamePayload,
	context: LikeRequestContext = {},
): Promise<LikeCount> {
	const normalizedSlug = normalizePathname(data.slug);

	try {
		return await fetchLikeCountFromDbServer(normalizedSlug, context);
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
		return await incrementLikeCountInDbServer(normalizedSlug, data.disabled, context);
	} catch (error) {
		// Unlike the read path, a failed write must not fail open: returning a
		// success-shaped zero would silently drop the like (and reset the UI to
		// 0). Throw so the client mutation rolls back and re-enables retry.
		warnCounterFailureOnce("increment likes", error);
		throw error;
	}
}

export async function decrementLikeCount(
	data: PagePathnamePayload,
	context: LikeRequestContext = {},
): Promise<LikeCount> {
	const normalizedSlug = normalizePathname(data.slug);

	try {
		return await decrementLikeCountInDbServer(normalizedSlug, context);
	} catch (error) {
		warnCounterFailureOnce("decrement likes", error);
		throw error;
	}
}
