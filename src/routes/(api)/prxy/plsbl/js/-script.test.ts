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
});
