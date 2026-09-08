import { beforeEach, describe, expect, test, vi } from "vitest";

const cloudflare = vi.hoisted<{ env: Record<string, unknown> }>(() => ({ env: {} }));
vi.mock("cloudflare:workers", () => cloudflare);

import { handleAnalyticsEventPost as handleAliasPost } from "../prxy/nltyx/event";
import { handleAnalyticsEventGet, handleAnalyticsEventPost } from "./event";

const origin = "https://sreetamdas.com";
const fetch = vi.fn(
	async (_url: string, _init?: RequestInit) => new Response(null, { status: 202 }),
);
function request(headers: Record<string, string> = {}) {
	return new Request(`${origin}/api/analytics/event`, {
		method: "POST",
		headers: { origin, "cf-connecting-ip": "192.0.2.1", "user-agent": "browser", ...headers },
		body: '{"name":"pageview"}',
	});
}
beforeEach(() => {
	fetch.mockClear();
	cloudflare.env = {
		STATS: { fetch },
		RELAY_TOKEN: "secret",
		ANALYTICS_PROJECT_SLUG: "site",
		ANALYTICS_ALLOWED_ORIGINS: origin,
	};
});

describe.each([handleAnalyticsEventPost, handleAliasPost])(
	"first-party analytics relay %s",
	(post) => {
		test("rejects GET", () => {
			const response = handleAnalyticsEventGet();
			expect(response.status).toBe(405);
			expect(response.headers.get("allow")).toBe("POST");
		});
		test("relays unchanged body with only trusted facts", async () => {
			const req = request({
				"x-relay-token": "forged",
				"x-relay-ip": "forged",
				"x-forwarded-for": "forged",
				"x-relay-country": "forged",
			});
			expect((await post(req)).status).toBe(202);
			const init = fetch.mock.calls[0]?.[1];
			expect(init?.body).toBe(req.body);
			const headers = new Headers(init?.headers);
			expect(headers.get("x-relay-token")).toBe("secret");
			expect(headers.get("x-relay-ip")).toBe("192.0.2.1");
			expect(headers.get("x-relay-country")).toBe("");
			expect(headers.has("x-forwarded-for")).toBe(false);
		});
		test.each([
			{ origin: "" },
			{ origin: "null" },
			{ origin: "https://evil.test" },
			{ origin: "https://sreetamdas.com.evil.test" },
			{ "sec-fetch-site": "cross-site" },
			{ "sec-fetch-site": "same-site" },
			{ "sec-fetch-mode": "navigate" },
			{ "sec-fetch-dest": "image" },
		])("rejects %j before touching body or service", async (headers) => {
			const req = request(headers);
			const body = vi.spyOn(req, "body", "get");
			expect((await post(req)).status).toBe(403);
			expect(body).not.toHaveBeenCalled();
			expect(fetch).not.toHaveBeenCalled();
		});
		test("fails closed with no configured origins", async () => {
			delete cloudflare.env.ANALYTICS_ALLOWED_ORIGINS;
			expect((await post(request())).status).toBe(403);
			expect(fetch).not.toHaveBeenCalled();
		});
		test("does not trust attacker-selected request host or forwarded host", async () => {
			const req = new Request("https://evil.test/api/analytics/event", {
				method: "POST",
				headers: { origin: "https://evil.test", "x-forwarded-host": "sreetamdas.com" },
			});
			expect((await post(req)).status).toBe(403);
			expect(fetch).not.toHaveBeenCalled();
		});
		test.each([
			"https://staging.sreetamdas.com",
			"https://dev.sreetamdas.com",
			"http://localhost:3000",
		])("supports explicitly configured %s", async (site) => {
			cloudflare.env.ANALYTICS_ALLOWED_ORIGINS = site;
			expect(
				(
					await post(
						new Request(`${site}/api/analytics/event`, {
							method: "POST",
							headers: { origin: site },
						}),
					)
				).status,
			).toBe(202);
		});
		test("does not fabricate a client IP", async () => {
			const req = request();
			req.headers.delete("cf-connecting-ip");
			expect((await post(req)).status).toBe(202);
			expect(new Headers(fetch.mock.calls[0]?.[1]?.headers).has("x-relay-ip")).toBe(false);
		});
	},
);
