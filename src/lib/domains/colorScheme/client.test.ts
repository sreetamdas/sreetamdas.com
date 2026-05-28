import { describe, expect, test } from "vitest";

import { getNextColorScheme, parseColorScheme } from "./client";

describe("parseColorScheme", () => {
	test("accepts supported color-scheme preferences", () => {
		expect(parseColorScheme("system")).toBe("system");
		expect(parseColorScheme("light")).toBe("light");
		expect(parseColorScheme("dark")).toBe("dark");
	});

	test("rejects unknown preferences", () => {
		expect(parseColorScheme("")).toBe("");
		expect(parseColorScheme("auto")).toBe("");
	});
});

describe("getNextColorScheme", () => {
	test("cycles through system, light, and dark", () => {
		expect(getNextColorScheme(undefined)).toBe("system");
		expect(getNextColorScheme("system")).toBe("light");
		expect(getNextColorScheme("light")).toBe("dark");
		expect(getNextColorScheme("dark")).toBe("system");
	});
});
