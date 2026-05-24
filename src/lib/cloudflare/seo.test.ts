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
});
