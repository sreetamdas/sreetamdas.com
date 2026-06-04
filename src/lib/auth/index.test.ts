import { describe, expect, test } from "vitest";

import { isAllowedPresenterEmail, parseAllowedPresenterEmails } from ".";

describe("presenter allowlist", () => {
	test("normalizes comma-separated emails", () => {
		expect(parseAllowedPresenterEmails("Sreetam@Example.com, friend@example.com, ")).toEqual(
			new Set(["sreetam@example.com", "friend@example.com"]),
		);
	});

	test("matches presenter emails case-insensitively", () => {
		expect(
			isAllowedPresenterEmail("SREETAM@example.com", {
				SLIDE_PRESENTER_EMAILS: "sreetam@example.com",
			}),
		).toBe(true);
		expect(
			isAllowedPresenterEmail("viewer@example.com", {
				SLIDE_PRESENTER_EMAILS: "sreetam@example.com",
			}),
		).toBe(false);
	});
});
