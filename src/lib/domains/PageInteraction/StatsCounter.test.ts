import { describe, expect, test } from "vitest";

import {
	getLikeHeartIconClassName,
	getLikeLoadingHeartIconClassName,
	getLikeMutationAction,
} from "./StatsCounter.helpers";

describe("getLikeHeartIconClassName", () => {
	test("adds a shimmer treatment while a like is being saved", () => {
		expect(getLikeHeartIconClassName({ isPending: true })).toContain("shimmer");
	});

	test("does not shimmer after the pending write has settled", () => {
		expect(getLikeHeartIconClassName({ isPending: false })).not.toContain("shimmer");
	});
});

describe("getLikeLoadingHeartIconClassName", () => {
	test("uses the pending shimmer treatment while likes are loading", () => {
		expect(getLikeLoadingHeartIconClassName()).toContain("like-heart-shimmer");
	});
});

describe("getLikeMutationAction", () => {
	test("allows liked posts to unlike in local dev", () => {
		expect(getLikeMutationAction({ hasLiked: true, isDev: true })).toBe("unlike");
	});

	test("keeps liked posts as like-only outside local dev", () => {
		expect(getLikeMutationAction({ hasLiked: true, isDev: false })).toBe("like");
	});

	test("likes unliked posts in local dev", () => {
		expect(getLikeMutationAction({ hasLiked: false, isDev: true })).toBe("like");
	});
});
