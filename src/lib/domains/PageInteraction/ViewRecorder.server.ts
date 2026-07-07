/**
 * Server-function page view recorder.
 *
 * Cached HTML cannot reliably run Worker document hooks, so hydrated pages call
 * this same-origin TanStack server function once per pathname. The write is
 * deduped in KV by both signed visitor identity and Cloudflare client IP hash so
 * repeated reloads or no-cookie replays from one visitor do not inflate D1
 * counters within the TTL window.
 */
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";

import { LIKES_SALT_VERSION } from "@/config";
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

type ViewWrite = (normalizedSlug: string) => Promise<void>;

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
		const [context, runtime] = await Promise.all([getViewRecordContext(), getViewRuntime()]);
		return await recordPageView(data, context, runtime, upsertPageViewInDb);
	});

export async function recordPageView(
	data: PagePathnamePayload,
	context: ViewRecordContext = {},
	runtime?: ViewRuntime,
	writeView: ViewWrite = upsertPageViewInDb,
): Promise<PageViewRecordResult> {
	const normalizedSlug = normalizeViewSlug(data.slug);
	if (data.disabled || !normalizedSlug || !runtime) {
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
		await writeView(normalizedSlug);
		return { recorded: true };
	} catch (error) {
		warnCounterFailureOnce("record page view", error);
		return { recorded: false };
	}
}

const getViewRuntime = createServerOnlyFn(async (): Promise<ViewRuntime> => {
	const { env } = await import("cloudflare:workers");
	return {
		KV: env.KV,
		LIKES_COOKIE_SECRET: env.LIKES_COOKIE_SECRET,
		LIKES_IP_SALT: env.LIKES_IP_SALT,
	};
});

const upsertPageViewInDb = createServerOnlyFn(async (normalizedSlug: string): Promise<void> => {
	const { getDb } = await import("@/db");
	const { upsertPageViews } = await import("@/lib/domains/PageViews");
	await upsertPageViews(getDb(), normalizedSlug);
});

const getViewRecordContext = createServerOnlyFn(async (): Promise<ViewRecordContext> => {
	const { getRequestHeader, setCookie } = await import("@tanstack/react-start/server");
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
});

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
