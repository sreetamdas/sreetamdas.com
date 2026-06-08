import { describe, expect, test } from "vitest";

import { normalizePathname } from "./utils";

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
