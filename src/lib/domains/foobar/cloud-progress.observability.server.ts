/** Privacy-safe operational signals: event names only, never user IDs or progress. */
import "@tanstack/react-start/server-only";

export type FoobarCloudOperation = "disabled" | "enabled" | "rejected_disabled_write";

type FoobarCloudOperationEvent = {
	message: string;
	level: "warning" | "info";
	tags: { domain: "foobar"; operation: FoobarCloudOperation };
};

export function getFoobarCloudOperationEvent(
	operation: FoobarCloudOperation,
): FoobarCloudOperationEvent {
	return {
		message: "Foobar cloud lifecycle",
		level: operation === "rejected_disabled_write" ? "warning" : "info",
		tags: { domain: "foobar", operation },
	};
}

export function recordFoobarCloudOperation(operation: FoobarCloudOperation) {
	void import("@sentry/cloudflare").then((Sentry) => {
		const event = getFoobarCloudOperationEvent(operation);
		Sentry.captureMessage(event.message, { level: event.level, tags: event.tags });
	});
}
