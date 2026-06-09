import { afterEach, describe, expect, test, vi } from "vitest";

import {
	getAuthSecret,
	getCloudflareUserInfo,
	getSiteUrl,
	isAllowedPresenterEmail,
	isCloudflareUserResponse,
	parseAllowedPresenterEmails,
} from ".";

function mockFetchOnce(response: { ok: boolean; json?: () => unknown }) {
	vi.stubGlobal(
		"fetch",
		vi.fn(() =>
			Promise.resolve({
				ok: response.ok,
				json: () => Promise.resolve(response.json?.()),
			}),
		),
	);
}

describe("presenter allowlist", () => {
	test("normalizes comma-separated emails", () => {
		expect(
			parseAllowedPresenterEmails(
				" Sreetam@Example.com, friend@example.com, SREETAM@example.com, ",
			),
		).toEqual(new Set(["sreetam@example.com", "friend@example.com"]));
	});

	test("treats missing or blank allowlists as empty", () => {
		expect(parseAllowedPresenterEmails(undefined)).toEqual(new Set());
		expect(parseAllowedPresenterEmails(" , , ")).toEqual(new Set());
	});

	test("matches presenter emails case-insensitively", () => {
		expect(
			isAllowedPresenterEmail("SREETAM@example.com", {
				SLIDE_PRESENTER_EMAILS: "sreetam@example.com",
			}),
		).toBe(true);
		expect(
			isAllowedPresenterEmail(" viewer@example.com ", {
				SLIDE_PRESENTER_EMAILS: "sreetam@example.com",
			}),
		).toBe(false);
		expect(
			isAllowedPresenterEmail(" sreetam@example.com ", {
				SLIDE_PRESENTER_EMAILS: "sreetam@example.com",
			}),
		).toBe(true);
	});

	test("fails closed when no allowlist is configured", () => {
		expect(isAllowedPresenterEmail("sreetam@example.com", {})).toBe(false);
		expect(isAllowedPresenterEmail("sreetam@example.com", { SLIDE_PRESENTER_EMAILS: "" })).toBe(
			false,
		);
		expect(isAllowedPresenterEmail("sreetam@example.com", { SLIDE_PRESENTER_EMAILS: " , " })).toBe(
			false,
		);
	});
});

describe("cloudflare user response validation", () => {
	test("accepts a well-formed user payload", () => {
		expect(
			isCloudflareUserResponse({ success: true, result: { id: "abc", email: "a@b.com" } }),
		).toBe(true);
	});

	test("accepts an error payload that omits result", () => {
		expect(isCloudflareUserResponse({ success: false })).toBe(true);
	});

	test("rejects non-objects and a missing or non-boolean success", () => {
		expect(isCloudflareUserResponse(null)).toBe(false);
		expect(isCloudflareUserResponse("nope")).toBe(false);
		expect(isCloudflareUserResponse({})).toBe(false);
		expect(isCloudflareUserResponse({ success: "yes" })).toBe(false);
	});

	test("rejects non-string id or email fields", () => {
		expect(isCloudflareUserResponse({ success: true, result: { id: 1 } })).toBe(false);
		expect(isCloudflareUserResponse({ success: true, result: { email: 2 } })).toBe(false);
		expect(isCloudflareUserResponse({ success: true, result: null })).toBe(false);
	});
});

describe("auth environment helpers", () => {
	test("uses SITE_URL before VITE_SITE_URL and falls back to production", () => {
		expect(
			getSiteUrl({ SITE_URL: "https://preview.example", VITE_SITE_URL: "https://vite.example" }),
		).toBe("https://preview.example");
		expect(getSiteUrl({ VITE_SITE_URL: "https://vite.example" })).toBe("https://vite.example");
		expect(getSiteUrl({})).toBe("https://sreetamdas.com");
	});

	test("uses BETTER_AUTH_SECRET when present and a dev fallback in development", () => {
		expect(getAuthSecret({ BETTER_AUTH_SECRET: "secret" }, false)).toBe("secret");
		expect(getAuthSecret({}, true)).toBe("dev-only-better-auth-secret-change-me");
	});

	test("throws when BETTER_AUTH_SECRET is missing in production", () => {
		expect(() => getAuthSecret({}, false)).toThrow("BETTER_AUTH_SECRET must be set in production");
	});
});

describe("getCloudflareUserInfo", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test("returns null without an access token and does not call fetch", async () => {
		const fetchSpy = vi.fn();
		vi.stubGlobal("fetch", fetchSpy);

		expect(await getCloudflareUserInfo({})).toBeNull();
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	test("returns null when the user endpoint responds with a non-ok status", async () => {
		mockFetchOnce({ ok: false });

		expect(await getCloudflareUserInfo({ accessToken: "token" })).toBeNull();
	});

	test("returns null when the payload is malformed or missing id/email", async () => {
		mockFetchOnce({ ok: true, json: () => ({ success: true, result: { id: "abc" } }) });
		expect(await getCloudflareUserInfo({ accessToken: "token" })).toBeNull();

		mockFetchOnce({ ok: true, json: () => "not-an-object" });
		expect(await getCloudflareUserInfo({ accessToken: "token" })).toBeNull();
	});

	test("maps a well-formed payload, composing the display name", async () => {
		mockFetchOnce({
			ok: true,
			json: () => ({
				success: true,
				result: {
					id: "cf-1",
					email: "presenter@example.com",
					first_name: "Sreetam",
					last_name: "Das",
					avatar_url: "https://img.example/a.png",
				},
			}),
		});

		expect(await getCloudflareUserInfo({ accessToken: "token" })).toEqual({
			id: "cf-1",
			email: "presenter@example.com",
			emailVerified: true,
			name: "Sreetam Das",
			image: "https://img.example/a.png",
		});
	});

	test("falls back to the email when no name parts are present", async () => {
		mockFetchOnce({
			ok: true,
			json: () => ({ success: true, result: { id: "cf-2", email: "noname@example.com" } }),
		});

		const user = await getCloudflareUserInfo({ accessToken: "token" });
		expect(user?.name).toBe("noname@example.com");
		expect(user?.image).toBeUndefined();
	});
});
