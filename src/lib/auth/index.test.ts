import { describe, expect, test } from "vitest";

import { getAuthSecret, getSiteUrl, isAllowedPresenterEmail, parseAllowedPresenterEmails } from ".";

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
