import { describe, expect, test } from "vitest";

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

			expect(response.status).toBe(502);
			expect(await response.json()).toEqual({
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
		let forwardedUserAgent = "";
		let forwardedAccept = "";
		globalThis.fetch = async (url, init) => {
			fetchedUrl = stringifyFetchInput(url);
			fetchedMethod = init?.method ?? "GET";
			const headers = new Headers(init?.headers);
			forwardedUserAgent = headers.get("user-agent") ?? "";
			forwardedAccept = headers.get("accept") ?? "";
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

			expect(fetchedUrl).toBe("https://plausible.io/js/script.js?foo=bar");
			expect(fetchedMethod).toBe("GET");
			expect(forwardedUserAgent).toBe("test-agent");
			expect(forwardedAccept).toBe("application/javascript");
			expect(response.status).toBe(200);
			expect(response.headers.get("content-type")).toBe("application/javascript");
			expect(response.headers.get("cache-control")).toBe("max-age=10");
			expect(await response.text()).toBe("console.log('ok')");
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("uses wildcard accept and empty user-agent when absent", async () => {
		const originalFetch = globalThis.fetch;
		let forwardedUserAgent = "__unset__";
		let forwardedAccept = "__unset__";

		globalThis.fetch = async (_url, init) => {
			const headers = new Headers(init?.headers);
			forwardedUserAgent = headers.get("user-agent") ?? "";
			forwardedAccept = headers.get("accept") ?? "";
			return new Response("ok", {
				status: 200,
				headers: { "content-type": "application/javascript" },
			});
		};

		try {
			const request = new Request("https://example.com/js/script.js");

			const response = await handlePlausibleScriptGet("script.js", request);

			expect(response.status).toBe(200);
			expect(forwardedUserAgent).toBe("");
			expect(forwardedAccept).toBe("*/*");
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("forwards upstream failures without rewriting status", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = async () => {
			return new Response("missing", {
				status: 404,
				headers: { "cache-control": "max-age=0" },
			});
		};

		try {
			const request = new Request("https://example.com/js/missing.js");

			const response = await handlePlausibleScriptGet("missing.js", request);

			expect(response.status).toBe(404);
			expect(response.headers.get("cache-control")).toBe("max-age=0");
			expect(await response.text()).toBe("missing");
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
