import { describe, expect, test, vi } from "vitest";

vi.mock("content-collections", () => ({
	allBlogPosts: [
		{ page_path: "/blog/published-post", published: true },
		{ page_path: "/blog/draft", published: false },
	],
	allRootPages: [
		{ page_path: "/credits", published: true },
		{ page_path: "/hidden", published: true, skip_page: true },
	],
}));
vi.mock("@/lib/domains/Buttondown", () => ({
	getNewsletterSnapshot: () => ({ results: [{ slug: "real-issue" }] }),
}));

import { isKnownViewPage } from "./ViewRecorder.pages.server";

describe("isKnownViewPage", () => {
	test.each([
		"/",
		"/about",
		"/stats",
		"/resume",
		"/foobar",
		"/slides/tanstack-start",
		"/blog/published-post",
		"/credits",
		"/newsletter/real-issue",
	])("allows routable %s", (path) => expect(isKnownViewPage(path)).toBe(true));
	test.each([
		"/bogus",
		"/blog/bogus",
		"/blog/draft",
		"/hidden",
		"/newsletter/bogus",
		"/api/analytics/event",
		"/assets/a.js",
		"/foobar/certificate/arbitrary",
	])("rejects %s", (path) => expect(isKnownViewPage(path)).toBe(false));
});
