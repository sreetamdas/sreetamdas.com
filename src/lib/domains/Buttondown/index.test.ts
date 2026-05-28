import { describe, expect, test } from "vitest";

import { fetchNewsletterEmails } from "./index";
import { BUTTONDOWN_EMAIL_MOCKS } from "./mocks";

describe("fetchNewsletterEmails", () => {
	test("uses checked-in mocks without fetching when the API key is missing", async () => {
		const originalFetch = globalThis.fetch;
		let fetched = false;
		globalThis.fetch = async () => {
			fetched = true;
			return new Response(null, { status: 500 });
		};

		try {
			const result = await fetchNewsletterEmails();

			expect(fetched).toBe(false);
			expect(result).toBe(BUTTONDOWN_EMAIL_MOCKS);
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("sends the Buttondown token when fetching remote emails", async () => {
		const originalFetch = globalThis.fetch;
		let authorization = "";
		globalThis.fetch = async (_url, init) => {
			const headers = new Headers(init?.headers);
			authorization = headers.get("Authorization") ?? "";

			return Response.json({
				count: 1,
				next: null,
				previous: null,
				results: [
					{
						body: "Hello",
						email_type: "public",
						excluded_tags: [],
						external_url: "",
						id: "email_1",
						included_tags: [],
						metadata: {},
						publish_date: "2026-05-28T00:00:00.000Z",
						secondary_id: 1,
						slug: "hello",
						subject: "Hello",
					},
				],
			});
		};

		try {
			const result = await fetchNewsletterEmails("buttondown_token");

			expect(authorization).toBe("Token buttondown_token");
			expect(result.results[0]?.slug).toBe("hello");
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("falls back to mocks when Buttondown returns an unexpected payload", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = async () => Response.json({ results: [{ slug: 123 }] });

		try {
			const result = await fetchNewsletterEmails("buttondown_token");

			expect(result).toBe(BUTTONDOWN_EMAIL_MOCKS);
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});
