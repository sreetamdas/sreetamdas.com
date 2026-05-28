import { describe, expect, test } from "vitest";

import { readPublicEnvString, readServerEnvString } from "./utils";

describe("readServerEnvString", () => {
	test("reads a non-enumerable Cloudflare binding", () => {
		const env: Record<string, unknown> = Object.create(null);
		Object.defineProperty(env, "GITHUB_RWC_GIST_ID", {
			value: "gist_123",
			enumerable: false,
		});

		expect(readServerEnvString(env, ["GITHUB_RWC_GIST_ID"])).toBe("gist_123");
	});

	test("does not fall back to VITE-prefixed keys", () => {
		const env: Record<string, unknown> = {
			VITE_BUTTONDOWN_API_KEY: "buttondown_123",
		};

		expect(readServerEnvString(env, ["BUTTONDOWN_API_KEY"])).toBe(undefined);
	});

	test("ignores empty strings", () => {
		const env: Record<string, unknown> = {
			NOTION_TOKEN: "",
		};

		expect(readServerEnvString(env, ["NOTION_TOKEN"])).toBe(undefined);
	});

	test("returns first matching key in priority order", () => {
		const env: Record<string, unknown> = {
			SECONDARY_KEY: "secondary",
			PRIMARY_KEY: "primary",
		};

		expect(readServerEnvString(env, ["PRIMARY_KEY", "SECONDARY_KEY"])).toBe("primary");
	});

	test("returns undefined when env object is unavailable", () => {
		expect(readServerEnvString(undefined, ["NOTION_TOKEN"])).toBe(undefined);
	});

	test("ignores non-string values", () => {
		const env: Record<string, unknown> = {
			NOTION_TOKEN: 12345,
			VITE_NOTION_TOKEN: true,
		};

		expect(readServerEnvString(env, ["NOTION_TOKEN"])).toBe(undefined);
	});
});

describe("readPublicEnvString", () => {
	test("falls back to VITE-prefixed keys for intentionally public values", () => {
		const env: Record<string, unknown> = {
			VITE_SENTRY_DSN: "https://example@sentry.io/1",
		};

		expect(readPublicEnvString(env, ["SENTRY_DSN"])).toBe("https://example@sentry.io/1");
	});

	test("prefers direct key when both direct and VITE-prefixed keys exist", () => {
		const env: Record<string, unknown> = {
			SENTRY_DSN: "direct",
			VITE_SENTRY_DSN: "vite",
		};

		expect(readPublicEnvString(env, ["SENTRY_DSN"])).toBe("direct");
	});

	test("does not double-prefix explicit VITE keys", () => {
		const env: Record<string, unknown> = {
			VITE_SITE_URL: "https://example.com",
		};

		expect(readPublicEnvString(env, ["VITE_SITE_URL"])).toBe("https://example.com");
	});
});
