import { beforeEach, describe, expect, test, vi } from "vitest";

const dataServer = vi.hoisted(() => ({
	decrementLikeCountInDb: vi.fn(),
	fetchLikeCountFromDb: vi.fn(),
	incrementLikeCountInDb: vi.fn(),
}));

vi.mock("./LikeButton.data.server", () => dataServer);

import { decrementLikeCount, fetchLikeCount, incrementLikeCount } from "./LikeButton.server";

beforeEach(() => {
	dataServer.decrementLikeCountInDb.mockReset();
	dataServer.fetchLikeCountFromDb.mockReset();
	dataServer.incrementLikeCountInDb.mockReset();
});

describe("fetchLikeCount", () => {
	test("delegates slugs to the data layer with a normalized slug and like request context", async () => {
		dataServer.fetchLikeCountFromDb.mockResolvedValue({ likes: 4, hasLiked: true });
		const context = { clientIp: "1.2.3.4", cookieHeader: "like_id=value" };

		expect(await fetchLikeCount({ slug: "/about/", disabled: false }, context)).toEqual({
			likes: 4,
			hasLiked: true,
		});
		expect(dataServer.fetchLikeCountFromDb).toHaveBeenCalledWith("/about", context);
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
	test("delegates slugs with the disabled flag and like request context", async () => {
		dataServer.incrementLikeCountInDb.mockResolvedValue({ likes: 5, hasLiked: true });
		const context = { clientIp: "1.2.3.4", cookieHeader: "like_id=value" };

		expect(await incrementLikeCount({ slug: "/about", disabled: false }, context)).toEqual({
			likes: 5,
			hasLiked: true,
		});
		expect(dataServer.incrementLikeCountInDb).toHaveBeenCalledWith("/about", false, context);
	});

	test("throws when the data layer write fails instead of failing open", async () => {
		dataServer.incrementLikeCountInDb.mockRejectedValue(new Error("write failed"));

		await expect(
			incrementLikeCount({ slug: "/blog/chameleon-text", disabled: false }),
		).rejects.toThrow("write failed");
	});
});

describe("decrementLikeCount", () => {
	test("delegates slugs with the like request context", async () => {
		dataServer.decrementLikeCountInDb.mockResolvedValue({ likes: 4, hasLiked: false });
		const context = { clientIp: "1.2.3.4", cookieHeader: "like_id=value" };

		expect(await decrementLikeCount({ slug: "/about/", disabled: false }, context)).toEqual({
			likes: 4,
			hasLiked: false,
		});
		expect(dataServer.decrementLikeCountInDb).toHaveBeenCalledWith("/about", context);
	});

	test("throws when the data layer write fails instead of failing open", async () => {
		dataServer.decrementLikeCountInDb.mockRejectedValue(new Error("write failed"));

		await expect(
			decrementLikeCount({ slug: "/blog/chameleon-text", disabled: false }),
		).rejects.toThrow("write failed");
	});
});
