import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { fetchViewCount } from "./ViewsCounter.serverFns";

describe("fetchViewCount", () => {
	test("returns zero when the Cloudflare env is unavailable", async () => {
		assert.deepEqual(await fetchViewCount({ slug: "/about", disabled: false }, undefined), {
			view_count: 0,
		});
	});

	test("returns zero for disabled counters", async () => {
		assert.deepEqual(await fetchViewCount({ slug: "/about", disabled: true }, undefined), {
			view_count: 0,
		});
	});
});
