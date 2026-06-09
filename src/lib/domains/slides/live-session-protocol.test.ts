import { describe, expect, test } from "vitest";

import {
	isReactionMessage,
	isSetSlideMessage,
	isSlideSessionReaction,
} from "./live-session-protocol";

describe("isReactionMessage", () => {
	test("accepts allowlisted reaction emoji", () => {
		expect(isReactionMessage({ type: "reaction", emoji: "👏" })).toBe(true);
		expect(isReactionMessage({ type: "reaction", emoji: "❤️" })).toBe(true);
	});

	test("rejects emoji outside the allowlist", () => {
		expect(isReactionMessage({ type: "reaction", emoji: "🎉" })).toBe(false);
		expect(isReactionMessage({ type: "reaction", emoji: "<script>alert(1)</script>" })).toBe(false);
		expect(isReactionMessage({ type: "reaction", emoji: "" })).toBe(false);
	});

	test("rejects malformed reaction messages", () => {
		expect(isReactionMessage({ type: "reaction" })).toBe(false);
		expect(isReactionMessage({ type: "vote", emoji: "👏" })).toBe(false);
		expect(isReactionMessage({ type: "reaction", emoji: 1 })).toBe(false);
		expect(isReactionMessage(null)).toBe(false);
	});
});

describe("isSetSlideMessage", () => {
	test("accepts a numeric slide and step", () => {
		expect(isSetSlideMessage({ type: "set-slide", slide: 2, step: 1 })).toBe(true);
	});

	test("rejects non-numeric or wrongly typed payloads", () => {
		expect(isSetSlideMessage({ type: "set-slide", slide: "2", step: 1 })).toBe(false);
		expect(isSetSlideMessage({ type: "set-slide", slide: 2 })).toBe(false);
		expect(isSetSlideMessage(null)).toBe(false);
	});

	test("rejects non-finite, fractional, or negative indices", () => {
		expect(isSetSlideMessage({ type: "set-slide", slide: 1.5, step: 0 })).toBe(false);
		expect(isSetSlideMessage({ type: "set-slide", slide: -1, step: 0 })).toBe(false);
		expect(isSetSlideMessage({ type: "set-slide", slide: 0, step: Number.NaN })).toBe(false);
		expect(isSetSlideMessage({ type: "set-slide", slide: 0, step: Number.POSITIVE_INFINITY })).toBe(
			false,
		);
	});
});

describe("isSlideSessionReaction", () => {
	test("accepts a fully-formed allowlisted reaction", () => {
		expect(isSlideSessionReaction({ type: "reaction", id: "abc", emoji: "👏", createdAt: 1 })).toBe(
			true,
		);
	});

	test("rejects emoji outside the allowlist", () => {
		expect(isSlideSessionReaction({ type: "reaction", id: "abc", emoji: "🎉", createdAt: 1 })).toBe(
			false,
		);
	});
});
