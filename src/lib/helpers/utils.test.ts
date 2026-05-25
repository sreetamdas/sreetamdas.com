import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { readEnvString } from "./utils";

describe("readEnvString", () => {
	test("reads a non-enumerable Cloudflare binding", () => {
		const env: Record<string, unknown> = Object.create(null);
		Object.defineProperty(env, "GITHUB_RWC_GIST_ID", {
			value: "gist_123",
			enumerable: false,
		});

		assert.equal(readEnvString(env, ["GITHUB_RWC_GIST_ID"]), "gist_123");
	});

	test("falls back to VITE-prefixed keys", () => {
		const env: Record<string, unknown> = {
			VITE_BUTTONDOWN_API_KEY: "buttondown_123",
		};

		assert.equal(readEnvString(env, ["BUTTONDOWN_API_KEY"]), "buttondown_123");
	});

	test("ignores empty strings", () => {
		const env: Record<string, unknown> = {
			NOTION_TOKEN: "",
		};

		assert.equal(readEnvString(env, ["NOTION_TOKEN"]), undefined);
	});

	test("prefers non-VITE key when both exist", () => {
		const env: Record<string, unknown> = {
			BUTTONDOWN_API_KEY: "direct_key",
			VITE_BUTTONDOWN_API_KEY: "vite_key",
		};

		assert.equal(readEnvString(env, ["BUTTONDOWN_API_KEY"]), "direct_key");
	});

	test("returns first matching key in priority order", () => {
		const env: Record<string, unknown> = {
			SECONDARY_KEY: "secondary",
			PRIMARY_KEY: "primary",
		};

		assert.equal(readEnvString(env, ["PRIMARY_KEY", "SECONDARY_KEY"]), "primary");
	});

	test("returns undefined when env object is unavailable", () => {
		assert.equal(readEnvString(undefined, ["NOTION_TOKEN"]), undefined);
	});

	test("ignores non-string values", () => {
		const env: Record<string, unknown> = {
			NOTION_TOKEN: 12345,
			VITE_NOTION_TOKEN: true,
		};

		assert.equal(readEnvString(env, ["NOTION_TOKEN"]), undefined);
	});
});
