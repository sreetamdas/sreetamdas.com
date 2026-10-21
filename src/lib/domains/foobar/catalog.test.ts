import { describe, expect, test } from "vitest";

import {
	FOOBAR_ACHIEVEMENTS,
	FOOBAR_REQUIRED_ACHIEVEMENTS,
	FOOBAR_TEASERS,
	FOOBAR_TIER_ORDER,
	FOOBAR_TIERS,
	getFoobarClue,
	hasCompletedFoobar,
	isFoobarAchievement,
	isFoobarClueId,
} from "./catalog";
import { FOOBAR_FLAGS, type FoobarNavigableFlag } from "./flags";

describe("Foobar catalogue", () => {
	test("defines all five tiers in progression order", () => {
		expect(FOOBAR_TIER_ORDER).toEqual(["discovery", "browser", "archaeology", "protocol", "meta"]);
		expect(FOOBAR_TIER_ORDER.map((tier) => FOOBAR_TIERS[tier].difficulty)).toEqual([1, 2, 3, 4, 5]);
	});

	test("gives every playable achievement four ordered hints", () => {
		const hintable = Object.values(FOOBAR_ACHIEVEMENTS).filter(
			(achievement) => achievement.hints.length > 0,
		);
		const playable = Object.keys(FOOBAR_ACHIEVEMENTS)
			.filter(isFoobarAchievement)
			.filter((achievement) => achievement !== "completed");

		expect(hintable).toHaveLength(playable.length);
		for (const achievement of hintable) {
			expect(achievement.hints).toHaveLength(4);
			expect(achievement.hints.every((hint) => hint.text.trim().length > 0)).toBe(true);
		}
	});

	test("gives every achievement a distinct display title", () => {
		const titles = Object.values(FOOBAR_ACHIEVEMENTS).map((achievement) => achievement.title);
		expect(titles.every((title) => title.trim().length > 0)).toBe(true);
		expect(new Set(titles)).toHaveLength(titles.length);
	});

	test("catalogues every requested follow-up achievement", () => {
		expect(Object.keys(FOOBAR_ACHIEVEMENTS)).toEqual(
			expect.arrayContaining([
				"campfire",
				"paper-trail",
				"print-preview",
				"feed-reader",
				"cookie-jar",
				"service-worker",
				"og-qr",
			]),
		);
		expect(FOOBAR_REQUIRED_ACHIEVEMENTS).not.toContain("campfire");
		expect(FOOBAR_REQUIRED_ACHIEVEMENTS).not.toContain("completed");
	});

	test("keeps optional bonuses out of completion requirements", () => {
		const all = Object.keys(FOOBAR_ACHIEVEMENTS).filter(isFoobarAchievement);
		const withoutCampfire = all.filter(
			(achievement) => achievement !== "completed" && achievement !== "campfire",
		);

		expect(FOOBAR_ACHIEVEMENTS.campfire.optional).toBe(true);
		expect(hasCompletedFoobar(withoutCampfire)).toBe(true);
		expect(
			hasCompletedFoobar(withoutCampfire.filter((achievement) => achievement !== "headers")),
		).toBe(false);
	});

	test("keeps reward paths out of achievement hints", () => {
		// A reward path can prefix a legitimate clue path (service-worker-clue),
		// so only count a match when the path ends at a segment boundary.
		const mentionsPath = (text: string, path: string) => {
			for (let index = text.indexOf(path); index !== -1; index = text.indexOf(path, index + 1)) {
				const next = text[index + path.length];
				if (next === undefined || !/[a-z0-9-]/.test(next)) return true;
			}

			return false;
		};

		for (const flag of Object.values(FOOBAR_FLAGS)) {
			if (!("slug" in flag) || flag.slug === "/") continue;

			const rewardPath = `/foobar/${flag.slug}`;
			const hints = FOOBAR_ACHIEVEMENTS[flag.name].hints;
			expect(hints.every((hint) => !mentionsPath(hint.text, rewardPath))).toBe(true);
		}
	});

	test("gives every achievement a locked teaser", () => {
		for (const achievement of Object.keys(FOOBAR_ACHIEVEMENTS)) {
			if (!isFoobarAchievement(achievement)) continue;
			expect(FOOBAR_TEASERS[achievement].trim()).not.toBe("");
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

	test("keeps self-completing achievements off guessable routes", () => {
		for (const name of [
			"navigator",
			"konami",
			"error404",
			"dogs",
			"offline",
			"campfire",
			"completed",
		] as const) {
			expect(FOOBAR_FLAGS[name]).not.toHaveProperty("slug");
		}
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
