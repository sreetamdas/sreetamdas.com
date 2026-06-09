import { beforeEach, describe, expect, test, vi } from "vitest";

const dataServer = vi.hoisted(() => ({ fetchViewCountFromDb: vi.fn() }));

vi.mock("./ViewsCounter.data.server", () => dataServer);

import { fetchViewCount } from "./ViewsCounter.server";

beforeEach(() => {
	dataServer.fetchViewCountFromDb.mockReset();
});

describe("fetchViewCount", () => {
	test("delegates to the data layer with a normalized slug and the disabled flag", async () => {
		dataServer.fetchViewCountFromDb.mockResolvedValue({ view_count: 7 });

		expect(await fetchViewCount({ slug: "/about/", disabled: false })).toEqual({ view_count: 7 });
		expect(dataServer.fetchViewCountFromDb).toHaveBeenCalledWith("/about", false);
	});

	test("does not trim the root pathname", async () => {
		dataServer.fetchViewCountFromDb.mockResolvedValue({ view_count: 3 });

		await fetchViewCount({ slug: "/", disabled: false });

		expect(dataServer.fetchViewCountFromDb).toHaveBeenCalledWith("/", false);
	});

	test("passes the disabled flag through to the data layer", async () => {
		dataServer.fetchViewCountFromDb.mockResolvedValue({ view_count: 42 });

		await fetchViewCount({ slug: "/about", disabled: true });

		expect(dataServer.fetchViewCountFromDb).toHaveBeenCalledWith("/about", true);
	});

	test("fails open when the data layer throws", async () => {
		dataServer.fetchViewCountFromDb.mockRejectedValue(new Error("write failed"));

		expect(await fetchViewCount({ slug: "/about", disabled: false })).toEqual({ view_count: 0 });
	});
});
