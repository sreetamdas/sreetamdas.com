import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { handlePlausibleScriptGet } from "./$script";

describe("plausible script proxy", () => {
	test("returns 502 when upstream script fetch throws", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = async () => {
			throw new Error("network down");
		};

		try {
			const request = new Request("https://example.com/js/script.js?foo=bar", {
				headers: {
					"user-agent": "test-agent",
					accept: "application/javascript",
				},
			});

			const response = await handlePlausibleScriptGet("script.js", request);

			assert.equal(response.status, 502);
			assert.deepEqual(await response.json(), {
				error: "Plausible script upstream is unavailable",
			});
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("forwards upstream script response with query params", async () => {
		const originalFetch = globalThis.fetch;
		let fetchedUrl = "";
		let fetchedMethod = "";
		globalThis.fetch = async (url, init) => {
			fetchedUrl = stringifyFetchInput(url);
			fetchedMethod = init?.method ?? "GET";
			return new Response("console.log('ok')", {
				status: 200,
				headers: { "content-type": "application/javascript", "cache-control": "max-age=10" },
			});
		};

		try {
			const request = new Request("https://example.com/js/script.js?foo=bar", {
				headers: {
					"user-agent": "test-agent",
					accept: "application/javascript",
				},
			});

			const response = await handlePlausibleScriptGet("script.js", request);

			assert.equal(fetchedUrl, "https://plausible.io/js/script.js?foo=bar");
			assert.equal(fetchedMethod, "GET");
			assert.equal(response.status, 200);
			assert.equal(response.headers.get("content-type"), "application/javascript");
			assert.equal(response.headers.get("cache-control"), "max-age=10");
			assert.equal(await response.text(), "console.log('ok')");
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});

function stringifyFetchInput(input: Parameters<typeof fetch>[0]): string {
	if (typeof input === "string") {
		return input;
	}
	if (input instanceof URL) {
		return input.toString();
	}
	return input.url;
}
