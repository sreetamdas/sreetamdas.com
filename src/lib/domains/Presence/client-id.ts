import { PRESENCE_CLIENT_ID_STORAGE_KEY, isPresenceClientId } from "./protocol";

type PresenceClientIdStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">;

export function createPresenceClientId(): string {
	if (typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}

	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function getOrCreatePresenceClientId(
	storage: PresenceClientIdStorage,
	createId: () => string = createPresenceClientId,
): string {
	try {
		const existing = storage.getItem(PRESENCE_CLIENT_ID_STORAGE_KEY);
		if (isPresenceClientId(existing)) return existing;
		if (existing !== null) storage.removeItem(PRESENCE_CLIENT_ID_STORAGE_KEY);

		const next = createId();
		if (isPresenceClientId(next)) {
			storage.setItem(PRESENCE_CLIENT_ID_STORAGE_KEY, next);
			return next;
		}
	} catch {
		// Fall through to an in-memory id for storage-denied browsers.
	}

	return createPresenceClientId();
}
