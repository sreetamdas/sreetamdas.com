import { describe, expect, test, vi } from "vitest";

import { fetchNewsletterEmails } from "./index";
import { BUTTONDOWN_EMAIL_MOCKS } from "./mocks";

describe("fetchNewsletterEmails", () => {
	test("uses checked-in mocks without fetching when the API key is missing", async () => {
		const fetchMock = stubFetch(async () => {
			return new Response(null, { status: 500 });
		});

		const result = await fetchNewsletterEmails();

		expect(fetchMock).not.toHaveBeenCalled();
		expect(result).toBe(BUTTONDOWN_EMAIL_MOCKS);
	});

	test("sends the Buttondown token when fetching remote emails", async () => {
		let authorization = "";
		stubFetch(async (_url, init) => {
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
		});

		const result = await fetchNewsletterEmails("buttondown_token");

		expect(authorization).toBe("Token buttondown_token");
		expect(result.results[0]?.slug).toBe("hello");
	});

	test("falls back to mocks when Buttondown returns an unexpected payload", async () => {
		stubFetch(async () => Response.json({ results: [{ slug: 123 }] }));

		const result = await fetchNewsletterEmails("buttondown_token");

		expect(result).toBe(BUTTONDOWN_EMAIL_MOCKS);
	});
});

function stubFetch(implementation: typeof fetch) {
	const fetchMock = vi.fn(implementation);
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}
