/**
 * Hydrated-page counter writes are checked entirely on the server. Approximate
 * edge budgets suppress rapid replay; refresh/return visits outside the short
 * window still count. The client disabled flag can only opt out, never bypass.
 */
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";

import { isAllowedBrowserWrite, isAutomatedBrowser } from "@/lib/analytics/browser-request";
import { normalizePathname } from "@/lib/helpers/utils";

import { type PagePathnamePayload, validatePagePathnamePayload } from "./shared";

export type PageViewRecordResult = { recorded: boolean };
export type ViewGuardEnv = {
	ANALYTICS_ALLOWED_ORIGINS?: string;
	LIKES_IP_SALT?: string;
	VIEW_RATE_LIMITER?: Pick<RateLimit, "limit">;
	VIEW_REPLAY_LIMITER?: Pick<RateLimit, "limit">;
};

export const recordPageViewServerFn = createServerFn({ method: "POST" })
	.validator((data) => validatePagePathnamePayload(data, "Invalid page view record payload"))
	.handler(async ({ data }) => recordPageViewFromRequest(data));

const recordPageViewFromRequest = createServerOnlyFn(async (data: PagePathnamePayload) => {
	const { recordPageViewInDb } = await import("./ViewRecorder.data.server");
	return recordPageViewInDb(data);
});

export async function recordPageView(
	data: PagePathnamePayload,
	request: Request,
	env: ViewGuardEnv,
	isKnownPage: (pathname: string) => boolean,
	writeView: (pathname: string) => Promise<void>,
	nowMs = Date.now(),
): Promise<PageViewRecordResult> {
	try {
		if (data.disabled || !isAllowedBrowserWrite(request, env.ANALYTICS_ALLOWED_ORIGINS)) {
			return { recorded: false };
		}
		const slug = normalizeViewSlug(data.slug);
		if (!slug || !isKnownPage(slug)) return { recorded: false };
		const ua = request.headers.get("user-agent") ?? "";
		const ip = request.headers.get("cf-connecting-ip");
		if (isAutomatedBrowser(ua) || !ip || ip.length > 64) return { recorded: false };
		const secret = env.LIKES_IP_SALT;
		if (!secret?.trim() || !env.VIEW_RATE_LIMITER || !env.VIEW_REPLAY_LIMITER) {
			return { recorded: false };
		}
		const day = new Date(nowMs).toISOString().slice(0, 10);
		const origin = request.headers.get("origin");
		const key = await crypto.subtle.importKey(
			"raw",
			new TextEncoder().encode(secret),
			{ name: "HMAC", hash: "SHA-256" },
			false,
			["sign"],
		);
		const budgetKey = await viewKey(key, ["view-budget:v1", day, origin, ip]);
		if (!(await env.VIEW_RATE_LIMITER.limit({ key: budgetKey })).success) {
			return { recorded: false };
		}
		const replayKey = await viewKey(key, ["view-replay:v1", day, origin, ip, ua, slug]);
		if (!(await env.VIEW_REPLAY_LIMITER.limit({ key: replayKey })).success) {
			return { recorded: false };
		}
		await writeView(slug);
		return { recorded: true };
	} catch {
		// Never log request facts or exceptions potentially containing them.
		return { recorded: false };
	}
}

async function viewKey(key: CryptoKey, facts: Array<string | null>): Promise<string> {
	const digest = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(JSON.stringify(facts)),
	);
	return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function normalizeViewSlug(slug: string): string | undefined {
	if (slug.length > 512 || !slug.startsWith("/") || slug.startsWith("//")) {
		return undefined;
	}
	for (const character of slug) {
		const code = character.charCodeAt(0);
		if (character === "\\" || code < 0x20 || code === 0x7f) {
			return undefined;
		}
	}
	const url = new URL(slug, "https://sreetamdas.com");
	return normalizePathname(url.pathname);
}
