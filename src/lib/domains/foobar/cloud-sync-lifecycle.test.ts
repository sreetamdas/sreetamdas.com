import { describe, expect, test } from "vitest";

import { isFoobarCloudLifecycle } from "./cloud-sync-lifecycle";

describe("Foobar cloud lifecycle", () => {
	test("accepts known lifecycle values", () => {
		expect(isFoobarCloudLifecycle("enabled")).toBe(true);
		expect(isFoobarCloudLifecycle("disabled")).toBe(true);
		expect(isFoobarCloudLifecycle("signed-out")).toBe(true);
	});

	test("rejects unknown values", () => {
		expect(isFoobarCloudLifecycle("signed-in")).toBe(false);
		expect(isFoobarCloudLifecycle(null)).toBe(false);
		expect(isFoobarCloudLifecycle({ lifecycle: "enabled" })).toBe(false);
	});
});
