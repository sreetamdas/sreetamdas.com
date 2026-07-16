import { describe, expect, test } from "vitest";

import { mergeFoobarProgress } from "./cloud-progress";
import { initialFoobarData, normalizeFoobarData } from "./store";

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

	test("produces stable JSON so equal progress comparison can skip no-op sync", () => {
		const local = {
			...initialFoobarData,
			unlocked: true,
			visited_pages: ["/foobar", "/about"],
			completed: ["unlocked", "headers"],
		};

		const remote = {
			...initialFoobarData,
			unlocked: true,
			visited_pages: ["/foobar", "/about"],
			completed: ["unlocked", "headers"],
		};

		const merged = mergeFoobarProgress(local, remote);
		const normalizedRemote = normalizeFoobarData(remote);

		expect(JSON.stringify(merged)).toBe(JSON.stringify(normalizedRemote));
	});

	test("produces different JSON when local and cloud progress differ", () => {
		const local = {
			...initialFoobarData,
			unlocked: true,
			completed: ["unlocked"],
		};

		const remote = {
			...initialFoobarData,
			completed: ["headers"],
		};

		const merged = mergeFoobarProgress(local, remote);
		const normalizedRemote = normalizeFoobarData(remote);

		expect(JSON.stringify(merged)).not.toBe(JSON.stringify(normalizedRemote));
	});
});

describe("Foobar service worker filter", () => {
	const endsWithFoobarSw = (url: string | undefined): boolean =>
		url?.endsWith("/foobar-sw.js") ?? false;

	test("matches /foobar-sw.js registrations", () => {
		expect(endsWithFoobarSw("https://sreetamdas.com/foobar-sw.js")).toBe(true);
		expect(endsWithFoobarSw("/foobar-sw.js")).toBe(true);
	});

	test("does not match other registrations", () => {
		expect(endsWithFoobarSw("https://sreetamdas.com/mockServiceWorker.js")).toBe(false);
		expect(endsWithFoobarSw("https://sreetamdas.com/sw.js")).toBe(false);
		expect(endsWithFoobarSw(undefined)).toBe(false);
	});
});
