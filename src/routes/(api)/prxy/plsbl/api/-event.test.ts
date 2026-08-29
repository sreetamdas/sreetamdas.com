import { describe, expect, test, vi } from "vitest";

import {
	buildRelayBody,
	handlePlausibleEventGet,
	handlePlausibleEventPost,
	relayToNativeStats,
} from "./event";

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
		stubFetch(async () => {
			throw new Error("network down");
		});

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
	});

	test("forwards upstream POST response", async () => {
		let fetchedUrl = "";
		let fetchedMethod = "";
		let forwardedContentType = "";
		let forwardedUserAgent = "";
		let forwardedIp = "";
		stubFetch(async (url, init) => {
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
		});

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
	});

	test("uses safe header defaults when proxy headers are missing", async () => {
		let forwardedContentType = "";
		let forwardedUserAgent = "";
		let forwardedIp = "";

		stubFetch(async (_url, init) => {
			const headers = new Headers(init?.headers);
			forwardedContentType = headers.get("content-type") ?? "";
			forwardedUserAgent = headers.get("user-agent") ?? "";
			forwardedIp = headers.get("x-forwarded-for") ?? "";
			return new Response("ok", { status: 200 });
		});

		const request = new Request("https://example.com/api/event", {
			method: "POST",
			body: "hello",
		});

		const response = await handlePlausibleEventPost(request);

		expect(response.status).toBe(200);
		expect(forwardedContentType).toMatch(/^text\/plain/);
		expect(forwardedUserAgent).toBe("");
		expect(forwardedIp).toBe("");
	});

	test("forwards upstream non-success responses", async () => {
		stubFetch(async () => {
			return new Response("rate limited", {
				status: 429,
				headers: { "retry-after": "30" },
			});
		});

		const request = new Request("https://example.com/api/event", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ event: "pageview" }),
		});

		const response = await handlePlausibleEventPost(request);

		expect(response.status).toBe(429);
		expect(response.headers.get("retry-after")).toBe("30");
		expect(await response.text()).toBe("rate limited");
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

describe("plausible v36 compact payload translation", () => {
	const ID = "0123456789abcdef0123456789abcdef";

	test("pageview: compact keys become collector long keys with a synthesized envelope", () => {
		const body = buildRelayBody(
			JSON.stringify({
				n: "pageview",
				u: "https://sreetamdas.com/blog/hello",
				d: "sreetamdas.com",
				r: "https://news.ycombinator.com/item?id=2",
			}),
			ID,
		);

		expect(JSON.parse(body)).toEqual({
			schema_version: 1,
			event_id: ID,
			wd: false,
			name: "pageview",
			url: "https://sreetamdas.com/blog/hello",
			referrer: "https://news.ycombinator.com/item?id=2",
		});
	});

	test("pageview: the tracker's domain key is dropped, not forwarded", () => {
		const parsed = JSON.parse(
			buildRelayBody(JSON.stringify({ n: "pageview", u: "https://sreetamdas.com/", d: "x" }), ID),
		);

		expect(parsed).not.toHaveProperty("d");
		expect(parsed).not.toHaveProperty("domain");
	});

	test("pageview: a null referrer survives translation as null", () => {
		const parsed = JSON.parse(
			buildRelayBody(JSON.stringify({ n: "pageview", u: "https://sreetamdas.com/", r: null }), ID),
		);

		expect(parsed.referrer).toBeNull();
	});

	test("engagement: engagement_ms and scroll_depth both map across", () => {
		const body = buildRelayBody(
			JSON.stringify({
				n: "engagement",
				u: "https://sreetamdas.com/blog/hello",
				d: "sreetamdas.com",
				e: 12_500,
				sd: 64,
			}),
			ID,
		);

		expect(JSON.parse(body)).toEqual({
			schema_version: 1,
			event_id: ID,
			wd: false,
			name: "engagement",
			url: "https://sreetamdas.com/blog/hello",
			engagement_ms: 12_500,
			scroll_depth: 64,
		});
	});

	test("custom: an unknown event name becomes a collector custom event", () => {
		const body = buildRelayBody(
			JSON.stringify({
				n: "Signup",
				u: "https://sreetamdas.com/",
				d: "sreetamdas.com",
				p: { plan: "pro", seats: 3, trial: true },
			}),
			ID,
		);

		expect(JSON.parse(body)).toEqual({
			schema_version: 1,
			event_id: ID,
			wd: false,
			name: "custom",
			event_name: "Signup",
			url: "https://sreetamdas.com/",
			props: { plan: "pro", seats: "3", trial: "true" },
		});
	});

	test("custom: interactive:false is preserved so bounce semantics match", () => {
		const parsed = JSON.parse(
			buildRelayBody(JSON.stringify({ n: "Signup", u: "https://sreetamdas.com/", i: false }), ID),
		);

		expect(parsed.interactive).toBe(false);
	});

	test("props on pageview and engagement are dropped, not relayed as properties_not_allowed", () => {
		const pageview = JSON.parse(
			buildRelayBody(
				JSON.stringify({ n: "pageview", u: "https://sreetamdas.com/", p: { a: "b" } }),
				ID,
			),
		);
		const engagement = JSON.parse(
			buildRelayBody(
				JSON.stringify({
					n: "engagement",
					u: "https://sreetamdas.com/",
					e: 1,
					sd: 1,
					p: { a: "b" },
				}),
				ID,
			),
		);

		expect(pageview).not.toHaveProperty("props");
		expect(engagement).not.toHaveProperty("props");
	});

	test("a payload with no url still relays so the collector rejects it, not this route", () => {
		const parsed = JSON.parse(buildRelayBody(JSON.stringify({ n: "pageview", d: "x" }), ID));

		expect(parsed.name).toBe("pageview");
		expect(parsed).not.toHaveProperty("url");
	});

	test("www and apex hostnames are relayed verbatim for the collector to allowlist", () => {
		for (const url of ["https://sreetamdas.com/x", "https://www.sreetamdas.com/x"]) {
			expect(JSON.parse(buildRelayBody(JSON.stringify({ n: "pageview", u: url }), ID)).url).toBe(
				url,
			);
		}
	});

	test("an already-long-key collector payload is passed through, not re-translated", () => {
		const parsed = JSON.parse(
			buildRelayBody(
				JSON.stringify({ name: "pageview", url: "https://sreetamdas.com/", referrer: null }),
				ID,
			),
		);

		expect(parsed).toEqual({
			schema_version: 1,
			event_id: ID,
			wd: false,
			name: "pageview",
			url: "https://sreetamdas.com/",
			referrer: null,
		});
	});

	test("a non-JSON body is relayed untouched so the collector rejects it", () => {
		expect(buildRelayBody("not json at all", ID)).toBe("not json at all");
	});
});

describe("native stats relay", () => {
	const FACTS = {
		slug: "sreetamdas-com-prod",
		token: "relay-token",
		ip: "203.0.113.7",
		ua: "test-agent",
		country: "IN",
		city: "Bengaluru",
	};

	test("posts the relay body to the project slug with transient request facts", async () => {
		let seenUrl = "";
		let seenBody = "";
		const seenHeaders = new Map<string, string>();
		const target = {
			fetch: async (url: string, init: RequestInit) => {
				seenUrl = url;
				seenBody = String(init.body);
				new Headers(init.headers).forEach((value, key) => seenHeaders.set(key, value));
				return new Response(JSON.stringify({ status: "accepted", duplicate: false }), {
					status: 202,
				});
			},
		};

		const outcome = await relayToNativeStats(target, '{"name":"pageview"}', FACTS);

		expect(seenUrl).toBe("https://stats.internal/v1/relay/sreetamdas-com-prod");
		expect(seenBody).toBe('{"name":"pageview"}');
		expect(seenHeaders.get("x-relay-token")).toBe("relay-token");
		expect(seenHeaders.get("x-relay-ip")).toBe("203.0.113.7");
		expect(seenHeaders.get("x-relay-ua")).toBe("test-agent");
		expect(seenHeaders.get("x-relay-country")).toBe("IN");
		expect(seenHeaders.get("x-relay-city")).toBe("Bengaluru");
		expect(outcome).toEqual({ status: 202, reason: null });
	});

	test("surfaces the collector's rejection reason instead of swallowing it", async () => {
		const target = {
			fetch: async () =>
				new Response(JSON.stringify({ status: "rejected", reason: "hostname_mismatch" }), {
					status: 400,
				}),
		};

		expect(await relayToNativeStats(target, "{}", FACTS)).toEqual({
			status: 400,
			reason: "hostname_mismatch",
		});
	});

	test("a non-JSON relay response yields a status-only outcome", async () => {
		const target = { fetch: async () => new Response("boom", { status: 500 }) };

		expect(await relayToNativeStats(target, "{}", FACTS)).toEqual({ status: 500, reason: null });
	});
});
