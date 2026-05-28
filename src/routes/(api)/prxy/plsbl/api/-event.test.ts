import { describe, expect, test } from "vitest";

import { handlePlausibleEventGet, handlePlausibleEventPost } from "./event";

describe("plausible event proxy", () => {
	test("returns structured 405 for GET", async () => {
		const response = handlePlausibleEventGet();

		expect(response.status).toBe(405);
		expect(response.headers.get("Allow")).toBe("POST");
		expect(await response.json()).toEqual({
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

			expect(response.status).toBe(502);
			expect(await response.json()).toEqual({
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
		let forwardedContentType = "";
		let forwardedUserAgent = "";
		let forwardedIp = "";
		globalThis.fetch = async (url, init) => {
			fetchedUrl = stringifyFetchInput(url);
			fetchedMethod = init?.method ?? "GET";
			const headers = new Headers(init?.headers);
			forwardedContentType = headers.get("content-type") ?? "";
			forwardedUserAgent = headers.get("user-agent") ?? "";
			forwardedIp = headers.get("x-forwarded-for") ?? "";
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

			expect(fetchedUrl).toBe("https://plausible.io/api/event");
			expect(fetchedMethod).toBe("POST");
			expect(forwardedContentType).toBe("application/json");
			expect(forwardedUserAgent).toBe("test-agent");
			expect(forwardedIp).toBe("1.2.3.4");
			expect(response.status).toBe(202);
			expect(response.headers.get("content-type")).toBe("text/plain");
			expect(response.headers.get("x-test-header")).toBe("ok");
			expect(await response.text()).toBe("accepted");
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("uses safe header defaults when proxy headers are missing", async () => {
		const originalFetch = globalThis.fetch;
		let forwardedContentType = "";
		let forwardedUserAgent = "";
		let forwardedIp = "";

		globalThis.fetch = async (_url, init) => {
			const headers = new Headers(init?.headers);
			forwardedContentType = headers.get("content-type") ?? "";
			forwardedUserAgent = headers.get("user-agent") ?? "";
			forwardedIp = headers.get("x-forwarded-for") ?? "";
			return new Response("ok", { status: 200 });
		};

		try {
			const request = new Request("https://example.com/api/event", {
				method: "POST",
				body: "hello",
			});

			const response = await handlePlausibleEventPost(request);

			expect(response.status).toBe(200);
			expect(forwardedContentType).toMatch(/^text\/plain/);
			expect(forwardedUserAgent).toBe("");
			expect(forwardedIp).toBe("");
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("forwards upstream non-success responses", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = async () => {
			return new Response("rate limited", {
				status: 429,
				headers: { "retry-after": "30" },
			});
		};

		try {
			const request = new Request("https://example.com/api/event", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ event: "pageview" }),
			});

			const response = await handlePlausibleEventPost(request);

			expect(response.status).toBe(429);
			expect(response.headers.get("retry-after")).toBe("30");
			expect(await response.text()).toBe("rate limited");
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
