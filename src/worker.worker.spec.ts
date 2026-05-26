/*
Integration smoke tests for the Worker runtime + bindings contract.
These run inside workerd via @cloudflare/vitest-pool-workers using wrangler.test.jsonc.
*/

import { env } from "cloudflare:test";
import { exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

describe("worker entrypoint", () => {
	it("responds with health payload and bound Durable Object namespace", async () => {
		const response = await exports.default.fetch("https://example.com/health");
		const body: unknown = await response.json();
		const isObject = typeof body === "object" && body !== null;
		const ok = isObject && "ok" in body ? body.ok : undefined;
		const hasPresenceBinding =
			isObject && "hasPresenceBinding" in body ? body.hasPresenceBinding : undefined;

		expect(response.status).toBe(200);
		expect(ok).toBe(true);
		expect(hasPresenceBinding).toBe(true);
	});

	it("returns 404 for an unknown route", async () => {
		const response = await exports.default.fetch("https://example.com/this-route-should-not-exist");

		expect(response.status).toBe(404);
	});

	it("can reach the presence durable object namespace directly", async () => {
		expect(env.SITE_PRESENCE).toBeDefined();
		if (!env.SITE_PRESENCE) {
			throw new Error("SITE_PRESENCE binding should be available in worker tests");
		}

		const response = await env.SITE_PRESENCE.getByName("global").fetch("https://example.com/");
		const body: unknown = await response.json();
		const isObject = typeof body === "object" && body !== null;
		const count = isObject && "count" in body ? body.count : undefined;

		expect(response.status).toBe(200);
		expect(typeof count).toBe("number");
	});
});
