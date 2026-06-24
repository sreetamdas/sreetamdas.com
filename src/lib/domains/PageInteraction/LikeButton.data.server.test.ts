import { beforeEach, describe, expect, test, vi } from "vitest";

const pageViews = vi.hoisted(() => ({
	decrementLikes: vi.fn(),
	getLikes: vi.fn(),
	incrementLikes: vi.fn(),
}));
const database = vi.hoisted(() => ({ getDb: vi.fn(() => ({})) }));
const cloudflare = vi.hoisted<{ env: Record<string, string | undefined> }>(() => ({ env: {} }));
const config = vi.hoisted(() => ({
	IS_DEV: true,
	LIKES_IP_ABUSE_LIMIT: 10,
	LIKES_SALT_VERSION: 1,
}));

vi.mock("@/lib/domains/PageViews", () => pageViews);
vi.mock("@/db", () => database);
vi.mock("cloudflare:workers", () => cloudflare);
vi.mock("@/config", () => config);

import {
	decrementLikeCountInDb,
	fetchLikeCountFromDb,
	incrementLikeCountInDb,
} from "./LikeButton.data.server";
import { createSignedLikeCookie, hashLikeVisitor, LIKE_ID_COOKIE_NAME } from "./LikeIdentity";

const TOKEN = "00000000-0000-4000-8000-000000000001";
const OTHER_TOKEN = "00000000-0000-4000-8000-000000000002";
const SHA256_HEX = /^[0-9a-f]{64}$/;

beforeEach(() => {
	pageViews.decrementLikes.mockReset().mockResolvedValue({ likes: 1, hasLiked: false });
	pageViews.getLikes.mockReset().mockResolvedValue({ likes: 1, hasLiked: false });
	pageViews.incrementLikes.mockReset().mockResolvedValue({ likes: 2, hasLiked: true });
	cloudflare.env = {};
	config.IS_DEV = true;
});

describe("incrementLikeCountInDb", () => {
	test("reads existing likes when disabled, while preserving the cookie identity", async () => {
		cloudflare.env = { LIKES_COOKIE_SECRET: "cookie-secret", LIKES_IP_SALT: "ip-salt" };
		const cookie = await createSignedLikeCookie("cookie-secret", TOKEN);

		await incrementLikeCountInDb("/blog/x", true, {
			clientIp: "1.2.3.4",
			cookieHeader: `${LIKE_ID_COOKIE_NAME}=${cookie.value}`,
		});

		expect(pageViews.getLikes).toHaveBeenCalledWith(
			expect.anything(),
			"/blog/x",
			expect.stringMatching(SHA256_HEX),
			1,
		);
		expect(pageViews.incrementLikes).not.toHaveBeenCalled();
	});

	test("reads existing likes as read-only when the cookie secret is missing", async () => {
		cloudflare.env = { LIKES_IP_SALT: "ip-salt" };

		const result = await incrementLikeCountInDb("/blog/x", false, { clientIp: "1.2.3.4" });

		expect(pageViews.getLikes).toHaveBeenCalledWith(
			expect.anything(),
			"/blog/x",
			undefined,
			undefined,
		);
		expect(pageViews.incrementLikes).not.toHaveBeenCalled();
		expect(result.readOnly).toBe(true);
	});

	test("reads existing likes as read-only when the ip salt is missing", async () => {
		cloudflare.env = { LIKES_COOKIE_SECRET: "cookie-secret" };
		const setLikeCookie = vi.fn();

		const result = await incrementLikeCountInDb("/blog/x", false, {
			clientIp: "1.2.3.4",
			setLikeCookie,
		});

		expect(pageViews.getLikes).toHaveBeenCalledWith(
			expect.anything(),
			"/blog/x",
			expect.stringMatching(SHA256_HEX),
			1,
		);
		expect(pageViews.incrementLikes).not.toHaveBeenCalled();
		expect(setLikeCookie).toHaveBeenCalledOnce();
		expect(result.readOnly).toBe(true);
	});

	test("increments with a cookie visitor hash and ip abuse hash", async () => {
		cloudflare.env = { LIKES_COOKIE_SECRET: "cookie-secret", LIKES_IP_SALT: "ip-salt" };
		const cookie = await createSignedLikeCookie("cookie-secret", TOKEN);

		await incrementLikeCountInDb("/blog/x", false, {
			clientIp: "1.2.3.4",
			cookieHeader: `${LIKE_ID_COOKIE_NAME}=${cookie.value}`,
		});

		expect(pageViews.incrementLikes).toHaveBeenCalledWith(expect.anything(), "/blog/x", {
			visitorHash: expect.stringMatching(SHA256_HEX),
			ipHash: expect.stringMatching(SHA256_HEX),
			saltVersion: 1,
			abuseLimit: 10,
		});
		expect(pageViews.getLikes).not.toHaveBeenCalled();
	});

	test("keeps the same cookie identity across different ips", async () => {
		cloudflare.env = { LIKES_COOKIE_SECRET: "cookie-secret", LIKES_IP_SALT: "ip-salt" };
		const cookie = await createSignedLikeCookie("cookie-secret", TOKEN);
		const cookieHeader = `${LIKE_ID_COOKIE_NAME}=${cookie.value}`;

		await incrementLikeCountInDb("/blog/x", false, { clientIp: "1.2.3.4", cookieHeader });
		await incrementLikeCountInDb("/blog/x", false, { clientIp: "5.6.7.8", cookieHeader });

		const firstInput = pageViews.incrementLikes.mock.calls[0]?.[2];
		const secondInput = pageViews.incrementLikes.mock.calls[1]?.[2];
		expect(firstInput?.visitorHash).toEqual(expect.stringMatching(SHA256_HEX));
		expect(secondInput?.visitorHash).toBe(firstInput?.visitorHash);
		expect(secondInput?.ipHash).not.toBe(firstInput?.ipHash);
	});

	test("keeps different tokens independent under the same ip", async () => {
		cloudflare.env = { LIKES_COOKIE_SECRET: "cookie-secret", LIKES_IP_SALT: "ip-salt" };
		const firstCookie = await createSignedLikeCookie("cookie-secret", TOKEN);
		const secondCookie = await createSignedLikeCookie("cookie-secret", OTHER_TOKEN);

		await incrementLikeCountInDb("/blog/x", false, {
			clientIp: "1.2.3.4",
			cookieHeader: `${LIKE_ID_COOKIE_NAME}=${firstCookie.value}`,
		});
		await incrementLikeCountInDb("/blog/x", false, {
			clientIp: "1.2.3.4",
			cookieHeader: `${LIKE_ID_COOKIE_NAME}=${secondCookie.value}`,
		});

		const firstInput = pageViews.incrementLikes.mock.calls[0]?.[2];
		const secondInput = pageViews.incrementLikes.mock.calls[1]?.[2];
		expect(secondInput?.visitorHash).not.toBe(firstInput?.visitorHash);
		expect(secondInput?.ipHash).toBe(firstInput?.ipHash);
	});

	test("rejects a tampered cookie and issues a replacement identity", async () => {
		cloudflare.env = { LIKES_COOKIE_SECRET: "cookie-secret", LIKES_IP_SALT: "ip-salt" };
		const cookie = await createSignedLikeCookie("cookie-secret", TOKEN);
		const trustedVisitorHash = await hashLikeVisitor("cookie-secret", TOKEN);
		const setLikeCookie = vi.fn();
		const tampered = cookie.value.replace(/.$/, "x");

		await incrementLikeCountInDb("/blog/x", false, {
			clientIp: "1.2.3.4",
			cookieHeader: `${LIKE_ID_COOKIE_NAME}=${tampered}`,
			setLikeCookie,
		});

		const input = pageViews.incrementLikes.mock.calls[0]?.[2];
		expect(input?.visitorHash).toEqual(expect.stringMatching(SHA256_HEX));
		expect(input?.visitorHash).not.toBe(trustedVisitorHash);
		expect(setLikeCookie).toHaveBeenCalledOnce();
	});
});

describe("decrementLikeCountInDb", () => {
	test("decrements with a cookie visitor hash in local dev", async () => {
		cloudflare.env = { LIKES_COOKIE_SECRET: "cookie-secret" };
		const cookie = await createSignedLikeCookie("cookie-secret", TOKEN);

		await decrementLikeCountInDb("/blog/x", {
			cookieHeader: `${LIKE_ID_COOKIE_NAME}=${cookie.value}`,
		});

		expect(pageViews.decrementLikes).toHaveBeenCalledWith(expect.anything(), "/blog/x", {
			visitorHash: expect.stringMatching(SHA256_HEX),
			saltVersion: 1,
		});
		expect(pageViews.getLikes).not.toHaveBeenCalled();
	});

	test("rejects unlike writes outside local dev", async () => {
		config.IS_DEV = false;
		cloudflare.env = { LIKES_COOKIE_SECRET: "cookie-secret" };
		const cookie = await createSignedLikeCookie("cookie-secret", TOKEN);

		await expect(
			decrementLikeCountInDb("/blog/x", {
				cookieHeader: `${LIKE_ID_COOKIE_NAME}=${cookie.value}`,
			}),
		).rejects.toThrow("Unliking is only available in local dev");
		expect(pageViews.decrementLikes).not.toHaveBeenCalled();
	});

	test("reads existing likes as read-only without a cookie identity", async () => {
		cloudflare.env = {};

		const result = await decrementLikeCountInDb("/blog/x");

		expect(pageViews.getLikes).toHaveBeenCalledWith(expect.anything(), "/blog/x");
		expect(pageViews.decrementLikes).not.toHaveBeenCalled();
		expect(result.readOnly).toBe(true);
	});
});

describe("fetchLikeCountFromDb", () => {
	test("reads likes with a cookie-derived visitor hash", async () => {
		cloudflare.env = { LIKES_COOKIE_SECRET: "cookie-secret", LIKES_IP_SALT: "ip-salt" };
		const cookie = await createSignedLikeCookie("cookie-secret", TOKEN);

		const result = await fetchLikeCountFromDb("/blog/x", {
			clientIp: "1.2.3.4",
			cookieHeader: `${LIKE_ID_COOKIE_NAME}=${cookie.value}`,
		});

		expect(pageViews.getLikes).toHaveBeenCalledWith(
			expect.anything(),
			"/blog/x",
			expect.stringMatching(SHA256_HEX),
			1,
		);
		expect(result.readOnly).toBe(false);
	});

	test("issues a new cookie when one is missing", async () => {
		cloudflare.env = { LIKES_COOKIE_SECRET: "cookie-secret", LIKES_IP_SALT: "ip-salt" };
		const setLikeCookie = vi.fn();

		const result = await fetchLikeCountFromDb("/blog/x", {
			clientIp: "1.2.3.4",
			setLikeCookie,
		});

		expect(pageViews.getLikes).toHaveBeenCalledWith(
			expect.anything(),
			"/blog/x",
			expect.stringMatching(SHA256_HEX),
			1,
		);
		expect(setLikeCookie).toHaveBeenCalledOnce();
		expect(result.readOnly).toBe(false);
	});

	test("reads likes without a visitor hash when the cookie secret is missing", async () => {
		cloudflare.env = { LIKES_IP_SALT: "ip-salt" };

		const result = await fetchLikeCountFromDb("/blog/x", { clientIp: "1.2.3.4" });

		expect(pageViews.getLikes).toHaveBeenCalledWith(
			expect.anything(),
			"/blog/x",
			undefined,
			undefined,
		);
		expect(result.readOnly).toBe(true);
	});
});
