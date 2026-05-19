import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { handlePlausibleEventGet, handlePlausibleEventPost } from "./event";

describe("plausible event proxy", () => {
	test("returns structured 405 for GET", async () => {
		const response = handlePlausibleEventGet();

		assert.equal(response.status, 405);
		assert.equal(response.headers.get("Allow"), "POST");
		assert.deepEqual(await response.json(), {
			error: "Method not allowed",
			allowed: ["POST"],
		});
	});

	test("returns 502 when upstream POST throws", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = async () => {
			throw new Error("network down");
		};

		try {
			const request = new Request("https://example.com/api/event", {
				method: "POST",
				headers: {
					"content-type": "application/json",
					"user-agent": "test-agent",
					"cf-connecting-ip": "1.2.3.4",
				},
				body: JSON.stringify({ event: "pageview" }),
			});

			const response = await handlePlausibleEventPost(request);

			assert.equal(response.status, 502);
			assert.deepEqual(await response.json(), {
				error: "Plausible upstream is unavailable",
			});
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});
