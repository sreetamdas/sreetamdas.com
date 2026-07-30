import { afterEach, describe, expect, test, vi } from "vitest";

import { normalizePathname, randomIntegerInclusive } from "./utils";

afterEach(() => {
	vi.restoreAllMocks();
});

describe("normalizePathname", () => {
	test("strips a trailing slash from nested paths", () => {
		expect(normalizePathname("/blog/x/")).toBe("/blog/x");
	});

	test("does not trim the root pathname", () => {
		expect(normalizePathname("/")).toBe("/");
	});

	test("keeps paths without trailing slashes unchanged", () => {
		expect(normalizePathname("/blog/x")).toBe("/blog/x");
	});

	test("only strips one trailing slash", () => {
		expect(normalizePathname("/blog/x//")).toBe("/blog/x/");
	});
});

describe("randomIntegerInclusive", () => {
	test("includes the minimum boundary", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		expect(randomIntegerInclusive(10, 15)).toBe(10);
	});

	test("includes the maximum boundary", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.999_999);
		expect(randomIntegerInclusive(10, 15)).toBe(15);
	});
});
