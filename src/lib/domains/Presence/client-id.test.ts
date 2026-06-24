import { describe, expect, test } from "vitest";

import { getOrCreatePresenceClientId } from "./client-id";
import { PRESENCE_CLIENT_ID_STORAGE_KEY } from "./protocol";

class MemoryStorage {
	private values = new Map<string, string>();

	getItem(key: string) {
		return this.values.get(key) ?? null;
	}

	setItem(key: string, value: string) {
		this.values.set(key, value);
	}

	removeItem(key: string) {
		this.values.delete(key);
	}
}

describe("getOrCreatePresenceClientId", () => {
	test("reuses a valid stored tab id", () => {
		const storage = new MemoryStorage();
		storage.setItem(PRESENCE_CLIENT_ID_STORAGE_KEY, "stored-client-1");

		expect(getOrCreatePresenceClientId(storage, () => "new-client-1")).toBe("stored-client-1");
	});

	test("replaces invalid stored ids", () => {
		const storage = new MemoryStorage();
		storage.setItem(PRESENCE_CLIENT_ID_STORAGE_KEY, "bad id");

		expect(getOrCreatePresenceClientId(storage, () => "new-client-1")).toBe("new-client-1");
		expect(storage.getItem(PRESENCE_CLIENT_ID_STORAGE_KEY)).toBe("new-client-1");
	});
});
