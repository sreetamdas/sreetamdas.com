import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { maybeHideFromSeo } from "./seo";

describe("maybeHideFromSeo", () => {
	test("returns the same response for non-200 responses", () => {
		const request = new Request("https://staging.sreetamdas.com/api/presence");
		const response = new Response(null, { status: 204 });

		const result = maybeHideFromSeo(response, request);

		assert.equal(result, response);
		assert.equal(result.status, 204);
	});

	test("adds noindex on non-production html responses", () => {
		const request = new Request("https://staging.sreetamdas.com/about");
		const response = new Response("<html></html>", {
			status: 200,
			headers: { "content-type": "text/html" },
		});

		const result = maybeHideFromSeo(response, request);

		assert.notEqual(result, response);
		assert.equal(result.status, 200);
		assert.equal(result.headers.get("X-Robots-Tag"), "noindex");
		assert.equal(result.headers.get("content-type"), "text/html");
	});

	test("does nothing on production hostnames", () => {
		const request = new Request("https://sreetamdas.com/about");
		const response = new Response("<html></html>", {
			status: 200,
			headers: { "content-type": "text/html" },
		});

		const result = maybeHideFromSeo(response, request);

		assert.equal(result, response);
		assert.equal(result.headers.get("X-Robots-Tag"), null);
	});

	test("does nothing on local development hostnames", () => {
		const localRequest = new Request("http://localhost:5173/about");
		const ipv4Request = new Request("http://127.0.0.1:3000/about");
		const ipv6Request = new Request("http://[::1]:3000/about");
		const response = new Response("<html></html>", {
			status: 200,
			headers: { "content-type": "text/html" },
		});

		assert.equal(maybeHideFromSeo(response, localRequest), response);
		assert.equal(maybeHideFromSeo(response, ipv4Request), response);
		assert.equal(maybeHideFromSeo(response, ipv6Request), response);
	});

	test("preserves body and status text when cloning non-production response", async () => {
		const request = new Request("https://preview.sreetamdas.workers.dev/about");
		const response = new Response("Preview HTML", {
			status: 200,
			statusText: "OK",
			headers: { "content-type": "text/html" },
		});

		const result = maybeHideFromSeo(response, request);

		assert.notEqual(result, response);
		assert.equal(result.status, 200);
		assert.equal(result.statusText, "OK");
		assert.equal(result.headers.get("X-Robots-Tag"), "noindex");
		assert.equal(await result.text(), "Preview HTML");
	});
});
