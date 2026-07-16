import { describe, expect, test } from "vitest";

import {
	FOOBAR_ACHIEVEMENTS,
	FOOBAR_TIER_ORDER,
	FOOBAR_TIERS,
	getFoobarClue,
	isFoobarAchievement,
	isFoobarClueId,
} from "./catalog";
import { FOOBAR_FLAGS, type FoobarNavigableFlag } from "./flags";

describe("Foobar catalogue", () => {
	test("defines all five tiers in progression order", () => {
		expect(FOOBAR_TIER_ORDER).toEqual(["discovery", "browser", "archaeology", "protocol", "meta"]);
		expect(FOOBAR_TIER_ORDER.map((tier) => FOOBAR_TIERS[tier].difficulty)).toEqual([1, 2, 3, 4, 5]);
	});

	test("gives every navigable achievement four ordered hints", () => {
		const hintable = Object.values(FOOBAR_ACHIEVEMENTS).filter(
			(achievement) => achievement.hints.length > 0,
		);

		expect(hintable).toHaveLength(14);
		for (const achievement of hintable) {
			expect(achievement.hints).toHaveLength(4);
			expect(achievement.hints.every((hint) => hint.text.trim().length > 0)).toBe(true);
		}
	});

	test("resolves only stable catalogue clue IDs", () => {
		expect(isFoobarClueId("headers:hint:2")).toBe(true);
		expect(getFoobarClue("headers:hint:2")).toMatchObject({
			id: "headers:hint:2",
			achievement: "headers",
			kind: "hint",
		});
		expect(isFoobarClueId("headers:hint:5")).toBe(false);
		expect(getFoobarClue("headers:hint:5")).toBeUndefined();
		expect(isFoobarClueId("restart:completed")).toBe(false);
		expect(getFoobarClue("restart:completed")).toBeUndefined();
	});

	test("keeps restart outside tier progress", () => {
		expect(Object.keys(FOOBAR_ACHIEVEMENTS)).not.toContain("restart");
		expect(isFoobarAchievement("headers")).toBe(true);
		expect(isFoobarAchievement("restart")).toBe(false);
		expect(isFoobarAchievement(null)).toBe(false);
	});

	test("attaches catalogue metadata to every navigable flag", () => {
		const navigableFlagMetadata: Record<FoobarNavigableFlag, { tier: keyof typeof FOOBAR_TIERS }> =
			FOOBAR_ACHIEVEMENTS;

		for (const flag of Object.values(FOOBAR_FLAGS)) {
			if ("slug" in flag) {
				expect(flag).toMatchObject(navigableFlagMetadata[flag.name]);
			}
		}
	});
});
