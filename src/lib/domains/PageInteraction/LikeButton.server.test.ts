import { beforeEach, describe, expect, test, vi } from "vitest";

const dataServer = vi.hoisted(() => ({
	fetchLikeCountFromDb: vi.fn(),
	incrementLikeCountInDb: vi.fn(),
}));

vi.mock("./LikeButton.data.server", () => dataServer);

import { fetchLikeCount, incrementLikeCount } from "./LikeButton.server";

beforeEach(() => {
	dataServer.fetchLikeCountFromDb.mockReset();
	dataServer.incrementLikeCountInDb.mockReset();
});

describe("fetchLikeCount", () => {
	test("delegates slugs to the data layer with a normalized slug and client ip", async () => {
		dataServer.fetchLikeCountFromDb.mockResolvedValue({ likes: 4, hasLiked: true });

		expect(await fetchLikeCount({ slug: "/about/", disabled: false }, "1.2.3.4")).toEqual({
			likes: 4,
			hasLiked: true,
		});
		expect(dataServer.fetchLikeCountFromDb).toHaveBeenCalledWith("/about", "1.2.3.4");
	});

	test("fails open when the data layer throws", async () => {
		dataServer.fetchLikeCountFromDb.mockRejectedValue(new Error("read failed"));

		expect(await fetchLikeCount({ slug: "/blog/chameleon-text", disabled: false })).toEqual({
			likes: 0,
			hasLiked: false,
		});
	});
});

describe("incrementLikeCount", () => {
	test("delegates slugs with the disabled flag and client ip", async () => {
		dataServer.incrementLikeCountInDb.mockResolvedValue({ likes: 5, hasLiked: true });

		expect(await incrementLikeCount({ slug: "/about", disabled: false }, "1.2.3.4")).toEqual({
			likes: 5,
			hasLiked: true,
		});
		expect(dataServer.incrementLikeCountInDb).toHaveBeenCalledWith("/about", false, "1.2.3.4");
	});

	test("throws when the data layer write fails instead of failing open", async () => {
		dataServer.incrementLikeCountInDb.mockRejectedValue(new Error("write failed"));

		await expect(
			incrementLikeCount({ slug: "/blog/chameleon-text", disabled: false }),
		).rejects.toThrow("write failed");
	});
});
