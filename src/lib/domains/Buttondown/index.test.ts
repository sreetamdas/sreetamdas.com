import { describe, expect, test, vi } from "vitest";

import { fetchNewsletterEmails, getNewsletterSnapshot } from "./index";
import { BUTTONDOWN_EMAIL_MOCKS } from "./mocks";

const SAMPLE_EMAIL = {
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
};

describe("fetchNewsletterEmails", () => {
	test("prefers the committed snapshot over fetching", async () => {
		const fetchMock = stubFetch(async () => new Response(null, { status: 500 }));
		const snapshot = {
			count: 1,
			next: null,
			previous: null,
			results: [{ ...SAMPLE_EMAIL, slug: "from-snapshot" }],
		};

		const result = await fetchNewsletterEmails("buttondown_token", snapshot);

		expect(fetchMock).not.toHaveBeenCalled();
		expect(result.results[0]?.slug).toBe("from-snapshot");
	});

	test("falls through an empty snapshot to the live API", async () => {
		const fetchMock = stubFetch(async () =>
			Response.json({ count: 1, next: null, previous: null, results: [SAMPLE_EMAIL] }),
		);

		const result = await fetchNewsletterEmails("buttondown_token", {
			count: 0,
			next: null,
			previous: null,
			results: [],
		});

		expect(fetchMock).toHaveBeenCalled();
		expect(result.results[0]?.slug).toBe("hello");
	});

	test("uses checked-in mocks without fetching when the API key is missing", async () => {
		const fetchMock = stubFetch(async () => {
			return new Response(null, { status: 500 });
		});

		const result = await fetchNewsletterEmails(undefined, null);

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
				results: [SAMPLE_EMAIL],
			});
		});

		const result = await fetchNewsletterEmails("buttondown_token", null);

		expect(authorization).toBe("Token buttondown_token");
		expect(result.results[0]?.slug).toBe("hello");
	});

	test("falls back to mocks when Buttondown returns an unexpected payload", async () => {
		stubFetch(async () => Response.json({ results: [{ slug: 123 }] }));

		const result = await fetchNewsletterEmails("buttondown_token", null);

		expect(result).toBe(BUTTONDOWN_EMAIL_MOCKS);
	});
});

describe("getNewsletterSnapshot", () => {
	test("returns the committed snapshot with issues", () => {
		const snapshot = getNewsletterSnapshot();

		expect(snapshot).toBeDefined();
		expect(snapshot?.results.length ?? 0).toBeGreaterThan(0);
	});
});

function stubFetch(implementation: typeof fetch) {
	const fetchMock = vi.fn(implementation);
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}
