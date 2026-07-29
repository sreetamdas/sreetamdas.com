import { describe, expect, test } from "vitest";

import { foobarCloudFailureLabel, type FoobarCloudFailedOperation } from "./cloud-sync-errors";

describe("Foobar cloud recovery copy", () => {
	test.each<[FoobarCloudFailedOperation, string]>([
		["load", "Could not check your cloud save."],
		["sync", "Could not save your latest progress."],
		["delete", "Could not delete your cloud save."],
		["enable", "Could not turn cloud saving back on."],
		["profile", "Could not update your leaderboard preference."],
	])("distinguishes %s failures", (operation, expected) => {
		expect(foobarCloudFailureLabel(operation)).toBe(expected);
	});
});
