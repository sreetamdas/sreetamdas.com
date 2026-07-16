import { describe, expect, test } from "vitest";

import { mergeFoobarProgress } from "./cloud-progress";
import { initialFoobarData } from "./store";

describe("Foobar cloud progress merge", () => {
	test("combines complementary local and remote progress without erasing either side", () => {
		const result = mergeFoobarProgress(
			{
				...initialFoobarData,
				unlocked: true,
				visited_pages: ["/about"],
				completed: ["unlocked"],
				clues_seen: [{ id: "headers:hint:1", seen_at: 20 }],
			},
			{
				...initialFoobarData,
				konami: true,
				visited_pages: ["/uses", "/about"],
				completed: ["headers"],
				clues_seen: [{ id: "headers:hint:2", seen_at: 30 }],
			},
		);

		expect(result).toMatchObject({
			unlocked: true,
			konami: true,
			visited_pages: ["/about", "/uses"],
			completed: ["unlocked", "headers"],
		});
		expect(result.clues_seen).toEqual([
			{ id: "headers:hint:1", seen_at: 20 },
			{ id: "unlocked:completed", seen_at: null },
			{ id: "headers:hint:2", seen_at: 30 },
			{ id: "headers:completed", seen_at: null },
		]);
	});

	test("keeps the earliest real clue timestamp instead of an imported null", () => {
		const result = mergeFoobarProgress(
			{
				...initialFoobarData,
				clues_seen: [
					{ id: "headers:hint:1", seen_at: null },
					{ id: "headers:hint:2", seen_at: 30 },
				],
			},
			{
				...initialFoobarData,
				clues_seen: [
					{ id: "headers:hint:1", seen_at: 20 },
					{ id: "headers:hint:2", seen_at: 40 },
				],
			},
		);

		expect(result.clues_seen).toEqual([
			{ id: "headers:hint:1", seen_at: 20 },
			{ id: "headers:hint:2", seen_at: 30 },
		]);
	});

	test("normalizes malformed persisted input before merging", () => {
		const result = mergeFoobarProgress(
			{ unlocked: "yes", completed: ["headers", "not-real"] },
			{ completed: ["teapot"], visited_pages: ["/", 7] },
		);

		expect(result.unlocked).toBe(false);
		expect(result.completed).toEqual(["headers", "teapot"]);
		expect(result.visited_pages).toEqual(["/"]);
	});
});
