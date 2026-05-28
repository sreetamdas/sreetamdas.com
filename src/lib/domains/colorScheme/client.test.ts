import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { getNextColorScheme, parseColorScheme } from "./client";

describe("parseColorScheme", () => {
	test("accepts supported color-scheme preferences", () => {
		assert.equal(parseColorScheme("system"), "system");
		assert.equal(parseColorScheme("light"), "light");
		assert.equal(parseColorScheme("dark"), "dark");
	});

	test("rejects unknown preferences", () => {
		assert.equal(parseColorScheme(""), "");
		assert.equal(parseColorScheme("auto"), "");
	});
});

describe("getNextColorScheme", () => {
	test("cycles through system, light, and dark", () => {
		assert.equal(getNextColorScheme(undefined), "system");
		assert.equal(getNextColorScheme("system"), "light");
		assert.equal(getNextColorScheme("light"), "dark");
		assert.equal(getNextColorScheme("dark"), "system");
	});
});
