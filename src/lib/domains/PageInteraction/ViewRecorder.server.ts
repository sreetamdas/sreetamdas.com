/**
 * Server-function page view recorder.
 *
 * Cached HTML cannot reliably run Worker document hooks, so hydrated pages call
 * this same-origin TanStack server function once per pathname. The write is
 * deduped in KV by both signed visitor identity and Cloudflare client IP hash so
 * repeated reloads or no-cookie replays from one visitor do not inflate D1
 * counters within the TTL window.
 */
import "@tanstack/react-start/server-only";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setCookie } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";

import { LIKES_SALT_VERSION } from "@/config";
import { getDb } from "@/db";
import { upsertPageViews } from "@/lib/domains/PageViews";
import { normalizePathname } from "@/lib/helpers/utils";

import {
	createSignedLikeCookie,
	getCookieValue,
	hashLikeIp,
	hashLikeVisitor,
	LIKE_ID_COOKIE_MAX_AGE_SECONDS,
	LIKE_ID_COOKIE_NAME,
	readSignedLikeCookie,
} from "./LikeIdentity";
import {
	type PagePathnamePayload,
	validatePagePathnamePayload,
	warnCounterFailureOnce,
} from "./shared";

const VIEW_DEDUP_TTL_SECONDS = 60 * 60;
const MAX_SLUG_LENGTH = 512;

type ViewDedupeStore = {
	get: (key: string) => Promise<string | null>;
	put: (key: string, value: string, options: KVNamespacePutOptions) => Promise<void>;
};

type ViewRuntime = {
	KV: ViewDedupeStore;
	LIKES_COOKIE_SECRET?: string;
	LIKES_IP_SALT?: string;
};

type ViewVisitor = {
	visitorHash: string;
	ipHash: string;
};

export type PageViewRecordResult = {
	recorded: boolean;
};

export type ViewRecordContext = {
	clientIp?: string;
	cookieHeader?: string;
	setViewCookie?: (cookieValue: string) => void;
};

export const recordPageViewServerFn = createServerFn({
	method: "POST",
})
	.validator((data) => {
		return validatePagePathnamePayload(data, "Invalid page view record payload");
	})
	.handler(async ({ data }) => {
		return await recordPageView(data, getViewRecordContext());
	});

export async function recordPageView(
	data: PagePathnamePayload,
	context: ViewRecordContext = {},
	runtime: ViewRuntime = env,
): Promise<PageViewRecordResult> {
	const normalizedSlug = normalizeViewSlug(data.slug);
	if (data.disabled || !normalizedSlug) {
		return { recorded: false };
	}

	try {
		const visitor = await getViewVisitor(context, runtime, normalizedSlug);
		if (!visitor) {
			warnCounterFailureOnce(
				"record page view identity",
				new Error("Missing page view identity configuration"),
			);
			return { recorded: false };
		}

		const dedupeKeys = getDedupeKeys(normalizedSlug, visitor);
		const alreadyRecorded = await hasRecentView(runtime.KV, dedupeKeys);
		if (alreadyRecorded) {
			return { recorded: false };
		}

		await markRecentView(runtime.KV, dedupeKeys);
		await upsertPageViews(getDb(), normalizedSlug);
		return { recorded: true };
	} catch (error) {
		warnCounterFailureOnce("record page view", error);
		return { recorded: false };
	}
}

function getViewRecordContext(): ViewRecordContext {
	const clientIp = getRequestHeader("cf-connecting-ip");
	const cookieHeader = getRequestHeader("cookie");
	const context: ViewRecordContext = {
		setViewCookie: (cookieValue) => {
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

	return context;
}

function normalizeViewSlug(slug: string): string | undefined {
	if (slug.length > MAX_SLUG_LENGTH || !slug.startsWith("/") || slug.startsWith("//")) {
		return undefined;
	}

	const url = new URL(slug, "https://sreetamdas.com");
	if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/assets/")) {
		return undefined;
	}

	return normalizePathname(url.pathname);
}

async function getViewVisitor(
	context: ViewRecordContext,
	runtime: ViewRuntime,
	normalizedSlug: string,
): Promise<ViewVisitor | undefined> {
	const cookieSecret = runtime.LIKES_COOKIE_SECRET || undefined;
	const ipSalt = runtime.LIKES_IP_SALT || undefined;
	if (!cookieSecret || !ipSalt || !context.clientIp) {
		return undefined;
	}

	const cookieValue = getCookieValue(context.cookieHeader, LIKE_ID_COOKIE_NAME);
	let token = await readSignedLikeCookie(cookieSecret, cookieValue);
	if (!token) {
		const signedCookie = await createSignedLikeCookie(cookieSecret);
		token = signedCookie.token;
		context.setViewCookie?.(signedCookie.value);
	}

	return {
		visitorHash: await hashLikeVisitor(cookieSecret, token),
		ipHash: await hashLikeIp(ipSalt, LIKES_SALT_VERSION, normalizedSlug, context.clientIp),
	};
}

function getDedupeKeys(normalizedSlug: string, visitor: ViewVisitor): Array<string> {
	return [
		`page-view:v1:visitor:${visitor.visitorHash}:${normalizedSlug}`,
		`page-view:v1:ip:${visitor.ipHash}`,
	];
}

async function hasRecentView(kv: ViewDedupeStore, dedupeKeys: Array<string>): Promise<boolean> {
	const matches = await Promise.all(dedupeKeys.map((key) => kv.get(key)));
	return matches.some((match) => match !== null);
}

async function markRecentView(kv: ViewDedupeStore, dedupeKeys: Array<string>): Promise<void> {
	await Promise.all(
		dedupeKeys.map((key) => kv.put(key, "1", { expirationTtl: VIEW_DEDUP_TTL_SECONDS })),
	);
}
