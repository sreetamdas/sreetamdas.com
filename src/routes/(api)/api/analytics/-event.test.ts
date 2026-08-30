import { describe, expect, test, vi } from "vitest";

const cloudflare = vi.hoisted<{ env: Record<string, unknown> }>(() => ({ env: {} }));
vi.mock("cloudflare:workers", () => cloudflare);

import { handleAnalyticsEventGet, handleAnalyticsEventPost } from "./event";

describe("native analytics event route", () => {
	test("rejects GET", () => {
		const response = handleAnalyticsEventGet();
		expect(response.status).toBe(405);
		expect(response.headers.get("allow")).toBe("POST");
	});

	test("relays the unchanged body and transient facts", async () => {
		const fetch = vi.fn((_url: string, init?: RequestInit) => {
			expect(init?.body).toBeInstanceOf(ReadableStream);
			const headers = new Headers(init?.headers);
			expect(headers.get("x-relay-token")).toBe("secret");
			expect(headers.get("x-relay-ip")).toBe("192.0.2.1");
			return Promise.resolve(new Response(null, { status: 202 }));
		});
		cloudflare.env = {
			STATS: { fetch },
			RELAY_TOKEN: "secret",
			ANALYTICS_PROJECT_SLUG: "site",
		};
		const response = await handleAnalyticsEventPost(
			new Request("https://example.com/api/analytics/event", {
				method: "POST",
				headers: { "cf-connecting-ip": "192.0.2.1", "user-agent": "test" },
				body: '{"name":"pageview"}',
			}),
		);
		expect(response.status).toBe(202);
	});

	test("does not fabricate a client IP when the request has none", async () => {
		const fetch = vi.fn((_url: string, init?: RequestInit) => {
			const headers = new Headers(init?.headers);
			expect(headers.has("x-relay-ip")).toBe(false);
			return Promise.resolve(new Response(null, { status: 202 }));
		});
		cloudflare.env = {
			STATS: { fetch },
			RELAY_TOKEN: "secret",
			ANALYTICS_PROJECT_SLUG: "site",
		};
		const response = await handleAnalyticsEventPost(
			new Request("https://example.com/api/analytics/event", {
				method: "POST",
				body: '{"name":"pageview"}',
			}),
		);
		expect(response.status).toBe(202);
	});
});
