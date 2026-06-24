import { describe, expect, test } from "vitest";

import { isButtondownEmailsResponse } from "./shared";

describe("isButtondownEmailsResponse", () => {
	test("accepts email responses used by the newsletter snapshot", () => {
		expect(
			isButtondownEmailsResponse({
				count: 1,
				next: null,
				previous: null,
				results: [{ body: "Hello", slug: "hello", subject: "Hello" }],
			}),
		).toBe(true);
	});

	test("rejects malformed email entries", () => {
		expect(isButtondownEmailsResponse({ results: [{ body: "Hello", slug: 123 }] })).toBe(false);
	});
});
