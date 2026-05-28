import { describe, expect, test } from "vitest";

import { maybeHideFromSeo } from "./seo";

describe("maybeHideFromSeo", () => {
	test("returns the same response for non-200 responses", () => {
		const request = new Request("https://staging.sreetamdas.com/api/presence");
		const response = new Response(null, { status: 204 });

		const result = maybeHideFromSeo(response, request);

		expect(result).toBe(response);
		expect(result.status).toBe(204);
	});

	test("adds noindex on non-production html responses", () => {
		const request = new Request("https://staging.sreetamdas.com/about");
		const response = new Response("<html></html>", {
			status: 200,
			headers: { "content-type": "text/html" },
		});

		const result = maybeHideFromSeo(response, request);

		expect(result).not.toBe(response);
		expect(result.status).toBe(200);
		expect(result.headers.get("X-Robots-Tag")).toBe("noindex");
		expect(result.headers.get("content-type")).toBe("text/html");
	});

	test("does nothing on production hostnames", () => {
		const request = new Request("https://sreetamdas.com/about");
		const response = new Response("<html></html>", {
			status: 200,
			headers: { "content-type": "text/html" },
		});

		const result = maybeHideFromSeo(response, request);

		expect(result).toBe(response);
		expect(result.headers.get("X-Robots-Tag")).toBe(null);
	});

	test("does nothing on local development hostnames", () => {
		const localRequest = new Request("http://localhost:5173/about");
		const ipv4Request = new Request("http://127.0.0.1:3000/about");
		const ipv6Request = new Request("http://[::1]:3000/about");
		const response = new Response("<html></html>", {
			status: 200,
			headers: { "content-type": "text/html" },
		});

		expect(maybeHideFromSeo(response, localRequest)).toBe(response);
		expect(maybeHideFromSeo(response, ipv4Request)).toBe(response);
		expect(maybeHideFromSeo(response, ipv6Request)).toBe(response);
	});

	test("preserves body and status text when cloning non-production response", async () => {
		const request = new Request("https://preview.sreetamdas.workers.dev/about");
		const response = new Response("Preview HTML", {
			status: 200,
			statusText: "OK",
			headers: { "content-type": "text/html" },
		});

		const result = maybeHideFromSeo(response, request);

		expect(result).not.toBe(response);
		expect(result.status).toBe(200);
		expect(result.statusText).toBe("OK");
		expect(result.headers.get("X-Robots-Tag")).toBe("noindex");
		expect(await result.text()).toBe("Preview HTML");
	});
});
