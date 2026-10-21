/** Cross-tab notification channel for cloud-save and auth lifecycle operations. */

const STORAGE_KEY = "foobar-cloud-sync-lifecycle";

export type FoobarCloudLifecycle = "disabled" | "enabled" | "signed-out";

export function isFoobarCloudLifecycle(value: unknown): value is FoobarCloudLifecycle {
	return value === "disabled" || value === "enabled" || value === "signed-out";
}

export function publishFoobarCloudLifecycle(lifecycle: FoobarCloudLifecycle) {
	window.localStorage.setItem(
		STORAGE_KEY,
		JSON.stringify({ lifecycle, nonce: crypto.randomUUID() }),
	);
}

export function subscribeFoobarCloudLifecycle(
	onLifecycle: (lifecycle: FoobarCloudLifecycle) => void,
) {
	function handleStorage(event: StorageEvent) {
		if (event.key !== STORAGE_KEY || !event.newValue) return;
		try {
			const value: unknown = JSON.parse(event.newValue);
			if (
				typeof value === "object" &&
				value !== null &&
				"lifecycle" in value &&
				isFoobarCloudLifecycle(value.lifecycle)
			) {
				onLifecycle(value.lifecycle);
			}
		} catch {
			// Ignore malformed storage written by older or unrelated clients.
		}
	}

	window.addEventListener("storage", handleStorage);
	return () => window.removeEventListener("storage", handleStorage);
}
