import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { readPublicEnvString, readServerEnvString } from "./utils";

describe("readServerEnvString", () => {
	test("reads a non-enumerable Cloudflare binding", () => {
		const env: Record<string, unknown> = Object.create(null);
		Object.defineProperty(env, "GITHUB_RWC_GIST_ID", {
			value: "gist_123",
			enumerable: false,
		});

		assert.equal(readServerEnvString(env, ["GITHUB_RWC_GIST_ID"]), "gist_123");
	});

	test("does not fall back to VITE-prefixed keys", () => {
		const env: Record<string, unknown> = {
			VITE_BUTTONDOWN_API_KEY: "buttondown_123",
		};

		assert.equal(readServerEnvString(env, ["BUTTONDOWN_API_KEY"]), undefined);
	});

	test("ignores empty strings", () => {
		const env: Record<string, unknown> = {
			NOTION_TOKEN: "",
		};

		assert.equal(readServerEnvString(env, ["NOTION_TOKEN"]), undefined);
	});

	test("returns first matching key in priority order", () => {
		const env: Record<string, unknown> = {
			SECONDARY_KEY: "secondary",
			PRIMARY_KEY: "primary",
		};

		assert.equal(readServerEnvString(env, ["PRIMARY_KEY", "SECONDARY_KEY"]), "primary");
	});

	test("returns undefined when env object is unavailable", () => {
		assert.equal(readServerEnvString(undefined, ["NOTION_TOKEN"]), undefined);
	});

	test("ignores non-string values", () => {
		const env: Record<string, unknown> = {
			NOTION_TOKEN: 12345,
			VITE_NOTION_TOKEN: true,
		};

		assert.equal(readServerEnvString(env, ["NOTION_TOKEN"]), undefined);
	});
});

describe("readPublicEnvString", () => {
	test("falls back to VITE-prefixed keys for intentionally public values", () => {
		const env: Record<string, unknown> = {
			VITE_SENTRY_DSN: "https://example@sentry.io/1",
		};

		assert.equal(readPublicEnvString(env, ["SENTRY_DSN"]), "https://example@sentry.io/1");
	});

	test("prefers direct key when both direct and VITE-prefixed keys exist", () => {
		const env: Record<string, unknown> = {
			SENTRY_DSN: "direct",
			VITE_SENTRY_DSN: "vite",
		};

		assert.equal(readPublicEnvString(env, ["SENTRY_DSN"]), "direct");
	});

	test("does not double-prefix explicit VITE keys", () => {
		const env: Record<string, unknown> = {
			VITE_SITE_URL: "https://example.com",
		};

		assert.equal(readPublicEnvString(env, ["VITE_SITE_URL"]), "https://example.com");
	});
});
