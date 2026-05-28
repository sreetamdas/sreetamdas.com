import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { shouldPrerenderPath } from "./prerender";

describe("shouldPrerenderPath", () => {
	test("keeps static newsletter index prerendered", () => {
		assert.equal(shouldPrerenderPath("/newsletter"), true);
		assert.equal(shouldPrerenderPath("/newsletter/"), true);
	});

	test("skips newsletter detail pages discovered from remote content", () => {
		assert.equal(shouldPrerenderPath("/newsletter/checking-out-react-query-and-svelte"), false);
	});

	test("keeps unrelated pages prerendered", () => {
		assert.equal(shouldPrerenderPath("/blog/chameleon-text"), true);
		assert.equal(shouldPrerenderPath("/rwc"), true);
	});
});
