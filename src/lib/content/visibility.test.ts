import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { shouldServeBlogPost, shouldServeRootPage } from "./visibility";

describe("content visibility", () => {
	test("serves published blog posts", () => {
		assert.equal(shouldServeBlogPost({ published: true }, { includeDrafts: false }), true);
	});

	test("hides draft blog posts outside draft-enabled contexts", () => {
		assert.equal(shouldServeBlogPost({ published: false }, { includeDrafts: false }), false);
	});

	test("allows draft blog posts when drafts are explicitly enabled", () => {
		assert.equal(shouldServeBlogPost({ published: false }, { includeDrafts: true }), true);
	});

	test("hides skipped root pages even when drafts are enabled", () => {
		assert.equal(
			shouldServeRootPage({ published: true, skip_page: true }, { includeDrafts: true }),
			false,
		);
	});

	test("hides draft root pages outside draft-enabled contexts", () => {
		assert.equal(shouldServeRootPage({ published: false }, { includeDrafts: false }), false);
	});
});
