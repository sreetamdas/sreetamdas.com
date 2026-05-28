import { describe, expect, test } from "vitest";

import { fetchViewCount } from "./ViewsCounter.serverFns";

describe("fetchViewCount", () => {
	test("returns zero when the Cloudflare env is unavailable", async () => {
		expect(await fetchViewCount({ slug: "/about", disabled: false }, undefined)).toEqual({
			view_count: 0,
		});
	});

	test("returns zero for disabled counters when the Cloudflare env is unavailable", async () => {
		expect(await fetchViewCount({ slug: "/about", disabled: true }, undefined)).toEqual({
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
			getPageViews: async () => ({ view_count: 0 }),
			upsertPageViews: async (_db: object, slug: string) => {
				calls.push(slug);
				return { view_count: 7 };
			},
		};

		const result = await fetchViewCount({ slug: "/about/", disabled: false }, undefined, deps);

		expect(result).toEqual({ view_count: 7 });
		expect(calls).toEqual(["getDb", "/about"]);
	});

	test("does not trim the root pathname", async () => {
		let receivedSlug = "";
		const fakeDb = {};
		const deps = {
			getDb: () => {
				return fakeDb;
			},
			getPageViews: async () => ({ view_count: 0 }),
			upsertPageViews: async (_db: object, slug: string) => {
				receivedSlug = slug;
				return { view_count: 3 };
			},
		};

		await fetchViewCount({ slug: "/", disabled: false }, undefined, deps);

		expect(receivedSlug).toBe("/");
	});

	test("fails open when db dependency throws", async () => {
		const deps = {
			getDb: () => {
				throw new Error("db init failed");
			},
			getPageViews: async () => ({ view_count: 0 }),
			upsertPageViews: async () => ({ view_count: 99 }),
		};

		expect(await fetchViewCount({ slug: "/about", disabled: false }, undefined, deps)).toEqual({
			view_count: 0,
		});
	});

	test("fails open when upsert throws", async () => {
		const fakeDb = {};
		const deps = {
			getDb: () => {
				return fakeDb;
			},
			getPageViews: async () => ({ view_count: 0 }),
			upsertPageViews: async () => {
				throw new Error("write failed");
			},
		};

		expect(await fetchViewCount({ slug: "/about", disabled: false }, undefined, deps)).toEqual({
			view_count: 0,
		});
	});

	test("reads existing counts when counter is disabled", async () => {
		const calls: string[] = [];
		const fakeDb = {};
		const deps = {
			getDb: () => {
				calls.push("getDb");
				return fakeDb;
			},
			getPageViews: async (_db: object, slug: string) => {
				calls.push(`read:${slug}`);
				return { view_count: 42 };
			},
			upsertPageViews: async () => {
				calls.push("upsert");
				return { view_count: 1 };
			},
		};

		const result = await fetchViewCount({ slug: "/about/", disabled: true }, undefined, deps);

		expect(result).toEqual({ view_count: 42 });
		expect(calls).toEqual(["getDb", "read:/about"]);
	});
});
