import { beforeEach, describe, expect, test, vi } from "vitest";

const pageViews = vi.hoisted(() => ({ upsertPageViews: vi.fn() }));

vi.mock("@/lib/domains/PageViews", () => pageViews);

import { recordPageView } from "./ViewRecorder.server";

beforeEach(() => {
	pageViews.upsertPageViews.mockReset().mockResolvedValue({ view_count: 12 });
});

describe("recordPageView", () => {
	test("records a page view for each valid call", async () => {
		const result = await recordPageView(
			{ slug: "/about?ignored=true", disabled: false },
			pageViews.upsertPageViews,
		);

		expect(result).toEqual({ recorded: true });
		expect(pageViews.upsertPageViews).toHaveBeenCalledWith("/about");
	});

	test("records refresh-like repeated calls as new views", async () => {
		const firstResult = await recordPageView(
			{ slug: "/about", disabled: false },
			pageViews.upsertPageViews,
		);
		const secondResult = await recordPageView(
			{ slug: "/about", disabled: false },
			pageViews.upsertPageViews,
		);

		expect(firstResult).toEqual({ recorded: true });
		expect(secondResult).toEqual({ recorded: true });
		expect(pageViews.upsertPageViews).toHaveBeenCalledTimes(2);
	});

	test("does not write when the counter is disabled", async () => {
		const result = await recordPageView(
			{ slug: "/about", disabled: true },
			pageViews.upsertPageViews,
		);

		expect(result).toEqual({ recorded: false });
		expect(pageViews.upsertPageViews).not.toHaveBeenCalled();
	});

	test("rejects invalid or non-page slugs before writing", async () => {
		const result = await recordPageView(
			{ slug: "/api/presence", disabled: false },
			pageViews.upsertPageViews,
		);

		expect(result).toEqual({ recorded: false });
		expect(pageViews.upsertPageViews).not.toHaveBeenCalled();
	});
});
