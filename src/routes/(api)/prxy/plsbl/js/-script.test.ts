import { describe, expect, test, vi } from "vitest";

import { handlePlausibleScriptGet } from "./$script";

describe("plausible script proxy", () => {
	test("returns 502 when upstream script fetch throws", async () => {
		stubFetch(async () => {
			throw new Error("network down");
		});

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
	});

	test("forwards upstream script response with query params", async () => {
		let fetchedUrl = "";
		let fetchedMethod = "";
		let forwardedUserAgent = "";
		let forwardedAccept = "";
		stubFetch(async (url, init) => {
			fetchedUrl = stringifyFetchInput(url);
			fetchedMethod = init?.method ?? "GET";
			const headers = new Headers(init?.headers);
			forwardedUserAgent = headers.get("user-agent") ?? "";
			forwardedAccept = headers.get("accept") ?? "";
			return new Response("console.log('ok')", {
				status: 200,
				headers: { "content-type": "application/javascript", "cache-control": "max-age=10" },
			});
		});

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
	});

	test("uses wildcard accept and empty user-agent when absent", async () => {
		let forwardedUserAgent = "__unset__";
		let forwardedAccept = "__unset__";

		stubFetch(async (_url, init) => {
			const headers = new Headers(init?.headers);
			forwardedUserAgent = headers.get("user-agent") ?? "";
			forwardedAccept = headers.get("accept") ?? "";
			return new Response("ok", {
				status: 200,
				headers: { "content-type": "application/javascript" },
			});
		});

		const request = new Request("https://example.com/js/script.js");

		const response = await handlePlausibleScriptGet("script.js", request);

		expect(response.status).toBe(200);
		expect(forwardedUserAgent).toBe("");
		expect(forwardedAccept).toBe("*/*");
	});

	test("forwards upstream failures without rewriting status", async () => {
		stubFetch(async () => {
			return new Response("missing", {
				status: 404,
				headers: { "cache-control": "max-age=0" },
			});
		});

		const request = new Request("https://example.com/js/missing.js");

		const response = await handlePlausibleScriptGet("missing.js", request);

		expect(response.status).toBe(404);
		expect(response.headers.get("cache-control")).toBe("max-age=0");
		expect(await response.text()).toBe("missing");
	});
});

function stubFetch(implementation: typeof fetch) {
	const fetchMock = vi.fn(implementation);
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

function stringifyFetchInput(input: Parameters<typeof fetch>[0]): string {
	if (typeof input === "string") {
		return input;
	}
	if (input instanceof URL) {
		return input.toString();
	}
	return input.url;
}
