/**
 * Worker API-backed page view recorder.
 *
 * The public HTML can stay edge-cached because the browser records a same-origin
 * POST to /api/views. Writes are deduped in KV by both signed visitor identity
 * and Cloudflare client IP hash so repeated reloads or no-cookie replays from
 * one visitor do not inflate D1 counters within the TTL window.
 */
import "@tanstack/react-start/server-only";
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
import { warnCounterFailureOnce } from "./shared";

const VIEW_DEDUP_TTL_SECONDS = 60 * 60;
const MAX_SLUG_LENGTH = 512;
const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

type ViewDedupeStore = {
	get: (key: string) => Promise<string | null>;
	put: (key: string, value: string, options: KVNamespacePutOptions) => Promise<void>;
};

type ViewRuntime = {
	KV: ViewDedupeStore;
	LIKES_COOKIE_SECRET?: string;
	LIKES_IP_SALT?: string;
};

type ViewPayload = {
	slug: string;
};

type ViewVisitor = {
	visitorHash: string;
	ipHash: string;
	setCookieValue?: string;
};

export async function handleViewRecordRequest(request: Request): Promise<Response> {
	return await handleViewRecordRequestForRuntime(request, env);
}

export async function handleViewRecordRequestForRuntime(
	request: Request,
	runtime: ViewRuntime,
): Promise<Response> {
	if (!isSameOriginMutation(request)) {
		return noStoreResponse(null, 403);
	}

	const payload = await readViewPayload(request);
	if (!payload) {
		return noStoreResponse(null, 400);
	}

	const normalizedSlug = normalizeViewSlug(payload.slug, request.url);
	if (!normalizedSlug) {
		return noStoreResponse(null, 400);
	}

	try {
		const visitor = await getViewVisitor(request, runtime, normalizedSlug);
		if (!visitor) {
			warnCounterFailureOnce(
				"record page view identity",
				new Error("Missing page view identity configuration"),
			);
			return noStoreResponse(null, 204);
		}

		const dedupeKeys = getDedupeKeys(normalizedSlug, visitor);
		const alreadyRecorded = await hasRecentView(runtime.KV, dedupeKeys);
		const headers = getResponseHeaders(visitor);

		if (!alreadyRecorded) {
			await markRecentView(runtime.KV, dedupeKeys);
			await upsertPageViews(getDb(), normalizedSlug);
		}

		return new Response(null, { status: 204, headers });
	} catch (error) {
		warnCounterFailureOnce("record page view", error);
		return noStoreResponse(null, 204);
	}
}

function isSameOriginMutation(request: Request): boolean {
	const requestOrigin = new URL(request.url).origin;
	const origin = request.headers.get("origin");
	if (origin) {
		return origin === requestOrigin;
	}

	const referer = request.headers.get("referer");
	if (!referer) {
		return false;
	}

	try {
		return new URL(referer).origin === requestOrigin;
	} catch {
		return false;
	}
}

async function readViewPayload(request: Request): Promise<ViewPayload | undefined> {
	let parsed: unknown;
	try {
		parsed = JSON.parse(await request.text());
	} catch {
		return undefined;
	}

	if (!isViewPayload(parsed)) {
		return undefined;
	}

	return { slug: parsed.slug };
}

function isViewPayload(data: unknown): data is ViewPayload {
	return (
		typeof data === "object" &&
		data !== null &&
		"slug" in data &&
		typeof data.slug === "string" &&
		data.slug.length > 0 &&
		data.slug.length <= MAX_SLUG_LENGTH
	);
}

function normalizeViewSlug(slug: string, requestUrl: string): string | undefined {
	if (!slug.startsWith("/") || slug.startsWith("//")) {
		return undefined;
	}

	const url = new URL(slug, requestUrl);
	if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/assets/")) {
		return undefined;
	}

	return normalizePathname(url.pathname);
}

async function getViewVisitor(
	request: Request,
	runtime: ViewRuntime,
	normalizedSlug: string,
): Promise<ViewVisitor | undefined> {
	const cookieSecret = runtime.LIKES_COOKIE_SECRET || undefined;
	const ipSalt = runtime.LIKES_IP_SALT || undefined;
	const clientIp = request.headers.get("cf-connecting-ip") ?? undefined;
	if (!cookieSecret || !ipSalt || !clientIp) {
		return undefined;
	}

	const cookieValue = getCookieValue(
		request.headers.get("cookie") ?? undefined,
		LIKE_ID_COOKIE_NAME,
	);
	let token = await readSignedLikeCookie(cookieSecret, cookieValue);
	let setCookieValue: string | undefined;
	if (!token) {
		const signedCookie = await createSignedLikeCookie(cookieSecret);
		token = signedCookie.token;
		setCookieValue = signedCookie.value;
	}

	const visitor: ViewVisitor = {
		visitorHash: await hashLikeVisitor(cookieSecret, token),
		ipHash: await hashLikeIp(ipSalt, LIKES_SALT_VERSION, normalizedSlug, clientIp),
	};
	if (setCookieValue) {
		visitor.setCookieValue = setCookieValue;
	}

	return visitor;
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

function getResponseHeaders(visitor: ViewVisitor): Headers {
	const headers = new Headers(NO_STORE_HEADERS);
	if (visitor.setCookieValue) {
		headers.set("Set-Cookie", getViewCookieHeader(visitor.setCookieValue));
	}
	return headers;
}

function getViewCookieHeader(cookieValue: string): string {
	return `${LIKE_ID_COOKIE_NAME}=${cookieValue}; Max-Age=${LIKE_ID_COOKIE_MAX_AGE_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

function noStoreResponse(body: BodyInit | null, status: number): Response {
	return new Response(body, { status, headers: NO_STORE_HEADERS });
}
