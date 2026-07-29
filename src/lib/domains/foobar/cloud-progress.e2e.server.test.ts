import { describe, expect, test } from "vitest";

import { readFoobarE2eUser } from "./cloud-progress.e2e.server";

describe("Foobar E2E authentication fixture", () => {
	test("is unavailable unless the CI build gate and exact cookie are present", () => {
		expect(readFoobarE2eUser("foobar-e2e-auth=enabled", false)).toBeNull();
		expect(readFoobarE2eUser("foobar-e2e-auth=wrong", true)).toBeNull();
		expect(readFoobarE2eUser("other=1; foobar-e2e-auth=enabled", true)).toEqual({
			id: "foobar-e2e-user",
			name: "Foobar E2E Hunter",
		});
	});
});
