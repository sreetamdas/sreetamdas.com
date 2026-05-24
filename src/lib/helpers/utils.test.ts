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
});
