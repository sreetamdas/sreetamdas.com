import { beforeEach, describe, expect, test, vi } from "vitest";

const pageViews = vi.hoisted(() => ({
	getLikes: vi.fn(),
	incrementLikes: vi.fn(),
}));
const database = vi.hoisted(() => ({ getDb: vi.fn(() => ({})) }));
const cloudflare = vi.hoisted<{ env: Record<string, unknown> }>(() => ({ env: {} }));

vi.mock("@/lib/domains/PageViews", () => pageViews);
vi.mock("@/db", () => database);
vi.mock("cloudflare:workers", () => cloudflare);
vi.mock("@/config", () => ({ IS_DEV: true, LIKES_SALT_VERSION: 1 }));

import { fetchLikeCountFromDb, incrementLikeCountInDb } from "./LikeButton.data.server";

const SHA256_HEX = /^[0-9a-f]{64}$/;

beforeEach(() => {
	pageViews.getLikes.mockReset().mockResolvedValue({ likes: 1, hasLiked: false });
	pageViews.incrementLikes.mockReset().mockResolvedValue({ likes: 2, hasLiked: true });
	cloudflare.env = {};
});

describe("incrementLikeCountInDb", () => {
	test("reads existing likes when disabled, even with a salt and ip", async () => {
		cloudflare.env = { LIKES_IP_SALT: "salt" };

		await incrementLikeCountInDb("/blog/x", true, "1.2.3.4");

		expect(pageViews.getLikes).toHaveBeenCalledWith(
			expect.anything(),
			"/blog/x",
			expect.stringMatching(SHA256_HEX),
		);
		expect(pageViews.incrementLikes).not.toHaveBeenCalled();
	});

	test("reads existing likes when no visitor hash can be derived (no salt)", async () => {
		const result = await incrementLikeCountInDb("/blog/x", false, "1.2.3.4");

		expect(pageViews.getLikes).toHaveBeenCalledWith(expect.anything(), "/blog/x", undefined);
		expect(pageViews.incrementLikes).not.toHaveBeenCalled();
		expect(result.readOnly).toBe(true);
	});

	test("increments when enabled and a visitor hash is derived", async () => {
		cloudflare.env = { LIKES_IP_SALT: "salt" };

		await incrementLikeCountInDb("/blog/x", false, "1.2.3.4");

		expect(pageViews.incrementLikes).toHaveBeenCalledWith(
			expect.anything(),
			"/blog/x",
			expect.stringMatching(SHA256_HEX),
			1,
		);
		expect(pageViews.getLikes).not.toHaveBeenCalled();
	});
});

describe("fetchLikeCountFromDb", () => {
	test("reads likes with a derived visitor hash when salt and ip are present", async () => {
		cloudflare.env = { LIKES_IP_SALT: "salt" };

		const result = await fetchLikeCountFromDb("/blog/x", "1.2.3.4");

		expect(pageViews.getLikes).toHaveBeenCalledWith(
			expect.anything(),
			"/blog/x",
			expect.stringMatching(SHA256_HEX),
		);
		expect(result.readOnly).toBe(false);
	});

	test("reads likes without a hash when the salt is missing", async () => {
		const result = await fetchLikeCountFromDb("/blog/x", "1.2.3.4");

		expect(pageViews.getLikes).toHaveBeenCalledWith(expect.anything(), "/blog/x", undefined);
		expect(result.readOnly).toBe(true);
	});
});
