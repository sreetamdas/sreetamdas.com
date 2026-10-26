import { describe, expect, test } from "vitest";

import {
	normalizeHighCardinalityName,
	redactEventText,
	redactFreeText,
	scrubBreadcrumb,
	scrubLogAttributes,
	scrubSpanData,
} from "./privacy";

describe("Sentry privacy helpers", () => {
	test("scrubSpanData drops URLs, header and user-agent attributes", () => {
		const data: Record<string, unknown> = {
			"url.full": "https://sreetamdas.com/newsletter?x=1",
			"http.request.header.cookie": "abc",
			"http.response.header.set-cookie": "abc",
			"user_agent.original": "Mozilla",
			"http.request.method": "GET",
		};

		scrubSpanData(data);

		expect(data).toEqual({ "http.request.method": "GET" });
	});

	test("scrubLogAttributes drops ip-shaped keys without eating words that contain ip", () => {
		const attributes: Record<string, unknown> = {
			"url.query": "?x=1",
			"cf.connecting.ip": "203.0.113.1",
			"client.ipv4": "203.0.113.1",
			user_agent: "Mozilla",
			"http.request.header.authorization": "Bearer x",
			route: "/blog",
			description: "kept",
			recipient: "kept",
			zip: "kept",
			pipeline: "kept",
		};

		scrubLogAttributes(attributes);

		expect(attributes).toEqual({
			route: "/blog",
			description: "kept",
			recipient: "kept",
			zip: "kept",
			pipeline: "kept",
		});
	});

	test("normalizeHighCardinalityName keeps the path and drops query and fragment", () => {
		expect(normalizeHighCardinalityName("GET https://sreetamdas.com/blog/post?ref=x#top")).toBe(
			"GET /blog/post",
		);
		expect(normalizeHighCardinalityName("/newsletter?page=2")).toBe("/newsletter");
	});

	test("redactFreeText keeps the origin and path but strips the query", () => {
		expect(redactFreeText("failed to load https://sreetamdas.com/a?token=secret")).toBe(
			"failed to load https://sreetamdas.com/a?[redacted]",
		);
		expect(redactFreeText("see /keebs?board=1 for details")).toBe(
			"see /keebs?[redacted] for details",
		);
	});

	test("redactEventText redacts message, logentry and exception values in place", () => {
		const event = {
			message: "boom https://x.dev/p?q=1",
			logentry: { message: "/resume?from=mail" },
			exception: { values: [{ value: "at https://x.dev/y?z=2" }] },
		};

		redactEventText(event);

		expect(event).toEqual({
			message: "boom https://x.dev/p?[redacted]",
			logentry: { message: "/resume?[redacted]" },
			exception: { values: [{ value: "at https://x.dev/y?[redacted]" }] },
		});
	});

	test("scrubBreadcrumb drops console and navigation breadcrumbs", () => {
		expect(scrubBreadcrumb({ category: "console" })).toBe(null);
		expect(scrubBreadcrumb({ category: "navigation" })).toBe(null);
	});

	test("scrubBreadcrumb scrubs data and message on the rest", () => {
		expect(
			scrubBreadcrumb({
				category: "fetch",
				message: "GET https://sreetamdas.com/blog?ref=x",
				data: {
					"url.full": "https://sreetamdas.com/blog?ref=x",
					"http.request.method": "GET",
				},
			}),
		).toEqual({
			category: "fetch",
			message: "GET /blog",
			data: { "http.request.method": "GET" },
		});
	});
});
