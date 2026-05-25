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

	test("normalizes a trailing slash before writing views", async () => {
		const calls: string[] = [];
		const fakeDb = {};
		const deps = {
			getDb: () => {
				calls.push("getDb");
				return fakeDb;
			},
			upsertPageViews: async (_db: object, slug: string) => {
				calls.push(slug);
				return { view_count: 7 };
			},
		};

		const result = await fetchViewCount(
			{ slug: "/about/", disabled: false },
			{} as CloudflareEnv,
			deps,
		);

		assert.deepEqual(result, { view_count: 7 });
		assert.deepEqual(calls, ["getDb", "/about"]);
	});

	test("does not trim the root pathname", async () => {
		let receivedSlug = "";
		const fakeDb = {};
		const deps = {
			getDb: () => {
				return fakeDb;
			},
			upsertPageViews: async (_db: object, slug: string) => {
				receivedSlug = slug;
				return { view_count: 3 };
			},
		};

		await fetchViewCount({ slug: "/", disabled: false }, {} as CloudflareEnv, deps);

		assert.equal(receivedSlug, "/");
	});

	test("fails open when db dependency throws", async () => {
		const deps = {
			getDb: () => {
				throw new Error("db init failed");
			},
			upsertPageViews: async () => ({ view_count: 99 }),
		};

		assert.deepEqual(
			await fetchViewCount({ slug: "/about", disabled: false }, {} as CloudflareEnv, deps),
			{ view_count: 0 },
		);
	});

	test("fails open when upsert throws", async () => {
		const fakeDb = {};
		const deps = {
			getDb: () => {
				return fakeDb;
			},
			upsertPageViews: async () => {
				throw new Error("write failed");
			},
		};

		assert.deepEqual(
			await fetchViewCount({ slug: "/about", disabled: false }, {} as CloudflareEnv, deps),
			{ view_count: 0 },
		);
	});

	test("does not call dependencies when counter is disabled", async () => {
		let called = false;
		const fakeDb = {};
		const deps = {
			getDb: () => {
				called = true;
				return fakeDb;
			},
			upsertPageViews: async () => {
				called = true;
				return { view_count: 1 };
			},
		};

		const result = await fetchViewCount(
			{ slug: "/about", disabled: true },
			{} as CloudflareEnv,
			deps,
		);

		assert.deepEqual(result, { view_count: 0 });
		assert.equal(called, false);
	});
});
