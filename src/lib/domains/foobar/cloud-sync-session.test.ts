import { describe, expect, test } from "vitest";

import { createFoobarCloudSyncSession } from "./cloud-sync-session";

describe("Foobar cloud sync session", () => {
	test("invalidates responses that started before cloud deletion", () => {
		const session = createFoobarCloudSyncSession();
		const pendingSync = session.begin();

		session.invalidate();

		expect(session.isCurrent(pendingSync)).toBe(false);
		expect(session.isCurrent(session.begin())).toBe(true);
	});
});
