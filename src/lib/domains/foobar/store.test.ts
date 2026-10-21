import { describe, expect, test, vi } from "vitest";
import { create } from "zustand";

import { FOOBAR_ACHIEVEMENTS, FOOBAR_PUZZLE_PREREQUISITES, isFoobarAchievement } from "./catalog";
import { createFoobarSlice, initialFoobarData, normalizeFoobarData } from "./store";

describe("Foobar progress", () => {
	test("normalizes legacy progress and imports completion notes", () => {
		const result = normalizeFoobarData({
			visited_pages: ["/", "/about"],
			konami: false,
			unlocked: true,
			completed: ["unlocked", "headers", "not-real", "headers"],
			all_achievements: false,
		});
		expect(result.completed).toEqual(["unlocked", "headers"]);
		expect(result.clues_seen).toEqual([
			{ id: "unlocked:completed", seen_at: null },
			{ id: "headers:completed", seen_at: null },
		]);
	});

	test("removes malformed and duplicate clue entries", () => {
		const result = normalizeFoobarData({
			...initialFoobarData,
			clues_seen: [
				{ id: "headers:hint:1", seen_at: 10 },
				{ id: "headers:hint:1", seen_at: 20 },
				{ id: "headers:hint:5", seen_at: 30 },
				{ id: "headers:hint:2", seen_at: "yesterday" },
			],
		});
		expect(result.clues_seen).toEqual([{ id: "headers:hint:1", seen_at: 10 }]);
	});

	test("removes clue timestamps outside the JavaScript Date range", () => {
		const result = normalizeFoobarData({
			...initialFoobarData,
			clues_seen: [
				{ id: "headers:hint:1", seen_at: Number.MAX_VALUE },
				{ id: "headers:hint:2", seen_at: 1_234 },
			],
		});

		expect(result.clues_seen).toEqual([{ id: "headers:hint:2", seen_at: 1_234 }]);
	});

	test("updates partial state immutably and replaces arrays", () => {
		const store = create(createFoobarSlice);
		const before = store.getState().foobar_data;
		store.getState().setFoobarData({ visited_pages: ["/new"] });
		expect(store.getState().foobar_data).not.toBe(before);
		expect(store.getState().foobar_data.visited_pages).toEqual(["/new"]);
	});

	test("appends visits to the current trail once", () => {
		const store = create(createFoobarSlice);
		store.getState().setFoobarData({ visited_pages: ["/foobar"] });
		store.getState().recordFoobarVisit("/about");
		store.getState().recordFoobarVisit("/about");
		expect(store.getState().foobar_data.visited_pages).toEqual(["/foobar", "/about"]);
	});

	test("records clues and completions once", () => {
		vi.spyOn(Date, "now").mockReturnValue(1234);
		const store = create(createFoobarSlice);
		store.getState().recordFoobarClue("headers:hint:1");
		store.getState().recordFoobarClue("headers:hint:1");
		store.getState().completeFoobarFlag("headers");
		store.getState().completeFoobarFlag("headers");
		expect(store.getState().foobar_data.completed).toEqual(["headers"]);
		expect(store.getState().foobar_data.clues_seen).toEqual([
			{ id: "headers:hint:1", seen_at: 1234 },
			{ id: "headers:completed", seen_at: 1234 },
		]);
		expect(store.getState().foobar_reveal_queue).toEqual(["headers"]);
	});

	test("does not announce a legacy completion clue repair", () => {
		const store = create(createFoobarSlice);
		store.getState().setFoobarData({ completed: ["headers"] });
		store.getState().completeFoobarFlag("headers");

		const clues = store.getState().foobar_data.clues_seen;
		expect(clues).toHaveLength(1);
		expect(clues[0]?.id).toBe("headers:completed");
		expect(typeof clues[0]?.seen_at).toBe("number");
		expect(store.getState().foobar_reveal_queue).toEqual([]);
	});

	test("queues meta reveals once and dismisses them in order", () => {
		const store = create(createFoobarSlice);
		store.getState().enqueueFoobarReveal("headers");
		store.getState().enqueueFoobarReveal("completed");
		store.getState().enqueueFoobarReveal("headers");

		expect(store.getState().foobar_reveal_queue).toEqual(["headers", "completed"]);
		store.getState().dismissFoobarReveal();
		expect(store.getState().foobar_reveal_queue).toEqual(["completed"]);
	});

	test("reset data clears arrays instead of deep-merging them", () => {
		const store = create(createFoobarSlice);
		store.getState().completeFoobarFlag("headers");
		store.getState().setFoobarData(initialFoobarData);
		expect(store.getState().foobar_data).toEqual(initialFoobarData);
	});

	test("counts a completed run without the campfire bonus as finished", () => {
		const completed = Object.keys(FOOBAR_ACHIEVEMENTS)
			.filter(isFoobarAchievement)
			.filter((achievement) => achievement !== "campfire");
		const result = normalizeFoobarData({ ...initialFoobarData, completed });

		expect(result.all_achievements).toBe(true);
	});

	test("does not finish a run that has every flag except the final puzzle", () => {
		const result = normalizeFoobarData({
			...initialFoobarData,
			completed: [...FOOBAR_PUZZLE_PREREQUISITES],
			all_achievements: true,
		});

		expect(result.completed).not.toContain("completed");
		expect(result.all_achievements).toBe(false);
	});

	test("drops a final puzzle claim while a tier is unfinished", () => {
		const result = normalizeFoobarData({
			...initialFoobarData,
			completed: [
				...FOOBAR_PUZZLE_PREREQUISITES.filter((achievement) => achievement !== "headers"),
				"completed",
			],
		});

		expect(result.completed).not.toContain("completed");
		expect(result.clues_seen.map((clue) => clue.id)).not.toContain("completed:completed");
		expect(result.all_achievements).toBe(false);
	});

	test("awards the final puzzle only after every puzzle tier is finished", () => {
		const store = create(createFoobarSlice);
		store
			.getState()
			.setFoobarData({ completed: FOOBAR_PUZZLE_PREREQUISITES.filter((a) => a !== "headers") });
		store.getState().completeFoobarFlag("completed");
		expect(store.getState().foobar_data.completed).not.toContain("completed");
		expect(store.getState().foobar_reveal_queue).toEqual([]);

		store.getState().completeFoobarFlag("headers");
		store.getState().completeFoobarFlag("completed");
		expect(store.getState().foobar_data.completed).toContain("completed");
		expect(store.getState().foobar_reveal_queue).toEqual(["headers", "completed"]);
	});

	test("recomputes stale endgame state against the current catalogue", () => {
		const result = normalizeFoobarData({
			...initialFoobarData,
			completed: ["unlocked", "headers"],
			all_achievements: true,
		});

		expect(result.all_achievements).toBe(false);
	});
});
