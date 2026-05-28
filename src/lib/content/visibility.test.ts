import { describe, expect, test } from "vitest";

import { shouldServeBlogPost, shouldServeRootPage } from "./visibility";

describe("content visibility", () => {
	test("serves published blog posts", () => {
		expect(shouldServeBlogPost({ published: true }, { includeDrafts: false })).toBe(true);
	});

	test("hides draft blog posts outside draft-enabled contexts", () => {
		expect(shouldServeBlogPost({ published: false }, { includeDrafts: false })).toBe(false);
	});

	test("allows draft blog posts when drafts are explicitly enabled", () => {
		expect(shouldServeBlogPost({ published: false }, { includeDrafts: true })).toBe(true);
	});

	test("hides skipped root pages even when drafts are enabled", () => {
		expect(shouldServeRootPage({ published: true, skip_page: true }, { includeDrafts: true })).toBe(
			false,
		);
	});

	test("hides draft root pages outside draft-enabled contexts", () => {
		expect(shouldServeRootPage({ published: false }, { includeDrafts: false })).toBe(false);
	});
});
