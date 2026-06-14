import { beforeEach, describe, expect, test, vi } from "vitest";

const views = vi.hoisted(() => ({ fetchViewCount: vi.fn() }));
const likes = vi.hoisted(() => ({ fetchLikeCount: vi.fn() }));

vi.mock("./ViewsCounter.server", () => views);
vi.mock("./LikeButton.server", () => likes);

import { fetchPageMetrics } from "./Metrics.server";

beforeEach(() => {
	views.fetchViewCount.mockReset();
	likes.fetchLikeCount.mockReset();
});

describe("fetchPageMetrics", () => {
	test("merges views and likes and forwards the client ip to likes only", async () => {
		views.fetchViewCount.mockResolvedValue({ view_count: 12 });
		likes.fetchLikeCount.mockResolvedValue({ likes: 3, hasLiked: true, readOnly: false });

		const data = { slug: "/blog/x", disabled: false };

		expect(await fetchPageMetrics(data, "1.2.3.4")).toEqual({
			view_count: 12,
			likes: 3,
			hasLiked: true,
			readOnly: false,
		});
		expect(views.fetchViewCount).toHaveBeenCalledWith(data);
		expect(likes.fetchLikeCount).toHaveBeenCalledWith(data, "1.2.3.4");
	});

	test("runs views and likes concurrently rather than serially", async () => {
		const order: Array<string> = [];
		views.fetchViewCount.mockImplementation(async () => {
			order.push("views:start");
			await new Promise((resolve) => setTimeout(resolve, 20));
			order.push("views:end");
			return { view_count: 1 };
		});
		likes.fetchLikeCount.mockImplementation(async () => {
			order.push("likes:start");
			await new Promise((resolve) => setTimeout(resolve, 5));
			order.push("likes:end");
			return { likes: 0, hasLiked: false };
		});

		await fetchPageMetrics({ slug: "/blog/x", disabled: false });

		// Both start before either resolves; a serial implementation would record
		// "views:start", "views:end" before "likes:start".
		expect(order.slice(0, 2)).toEqual(["views:start", "likes:start"]);
	});
});
