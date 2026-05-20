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

	test("forwards upstream POST response", async () => {
		const originalFetch = globalThis.fetch;
		let fetchedUrl = "";
		let fetchedMethod = "";
		globalThis.fetch = async (url, init) => {
			fetchedUrl = stringifyFetchInput(url);
			fetchedMethod = init?.method ?? "GET";
			return new Response("accepted", {
				status: 202,
				headers: { "content-type": "text/plain", "x-test-header": "ok" },
			});
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

			assert.equal(fetchedUrl, "https://plausible.io/api/event");
			assert.equal(fetchedMethod, "POST");
			assert.equal(response.status, 202);
			assert.equal(response.headers.get("content-type"), "text/plain");
			assert.equal(response.headers.get("x-test-header"), "ok");
			assert.equal(await response.text(), "accepted");
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
