import { beforeEach, describe, expect, test, vi } from "vitest";

const pageViews = vi.hoisted(() => ({ getPageViews: vi.fn() }));
const database = vi.hoisted(() => ({ getDb: vi.fn(() => ({})) }));

vi.mock("@/lib/domains/PageViews", () => pageViews);
vi.mock("@/db", () => database);

import { fetchViewCountFromDb } from "./ViewsCounter.data.server";

beforeEach(() => {
	pageViews.getPageViews.mockReset().mockResolvedValue({ view_count: 42 });
});

describe("fetchViewCountFromDb", () => {
	// Regression: the RPC used to upsert (increment) on disabled=false, which was
	// replayable by any HTTP client and inflated view counters. The client path
	// must always read and never write.
	test("always reads and never writes, even with disabled=false", async () => {
		expect(await fetchViewCountFromDb("/about", false)).toEqual({ view_count: 42 });
		expect(pageViews.getPageViews).toHaveBeenCalledWith(expect.anything(), "/about");
	});

	test("reads existing counts when disabled (flag is now vestigial on the view path)", async () => {
		expect(await fetchViewCountFromDb("/about", true)).toEqual({ view_count: 42 });
		expect(pageViews.getPageViews).toHaveBeenCalledWith(expect.anything(), "/about");
	});
});
