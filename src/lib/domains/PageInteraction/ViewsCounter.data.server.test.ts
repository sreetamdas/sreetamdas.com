import { beforeEach, describe, expect, test, vi } from "vitest";

const pageViews = vi.hoisted(() => ({
	getPageViews: vi.fn(),
	upsertPageViews: vi.fn(),
}));
const database = vi.hoisted(() => ({ getDb: vi.fn(() => ({})) }));

vi.mock("@/lib/domains/PageViews", () => pageViews);
vi.mock("@/db", () => database);

import { fetchViewCountFromDb } from "./ViewsCounter.data.server";

beforeEach(() => {
	pageViews.getPageViews.mockReset().mockResolvedValue({ view_count: 42 });
	pageViews.upsertPageViews.mockReset().mockResolvedValue({ view_count: 7 });
});

describe("fetchViewCountFromDb", () => {
	test("upserts the page view when enabled", async () => {
		expect(await fetchViewCountFromDb("/about", false)).toEqual({ view_count: 7 });
		expect(pageViews.upsertPageViews).toHaveBeenCalledWith(expect.anything(), "/about");
		expect(pageViews.getPageViews).not.toHaveBeenCalled();
	});

	test("reads existing counts when disabled", async () => {
		expect(await fetchViewCountFromDb("/about", true)).toEqual({ view_count: 42 });
		expect(pageViews.getPageViews).toHaveBeenCalledWith(expect.anything(), "/about");
		expect(pageViews.upsertPageViews).not.toHaveBeenCalled();
	});
});
