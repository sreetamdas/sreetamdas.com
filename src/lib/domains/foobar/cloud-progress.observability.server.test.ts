import { describe, expect, test } from "vitest";

import { getFoobarCloudOperationEvent } from "./cloud-progress.observability.server";

describe("Foobar cloud observability", () => {
	test("records lifecycle metadata without user IDs or progress", () => {
		expect(getFoobarCloudOperationEvent("rejected_disabled_write")).toEqual({
			message: "Foobar cloud lifecycle",
			level: "warning",
			tags: { domain: "foobar", operation: "rejected_disabled_write" },
		});
	});
});
