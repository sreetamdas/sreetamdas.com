/** User-facing recovery copy for each cloud-save operation. */

export type FoobarCloudFailedOperation = "load" | "sync" | "delete" | "enable" | "profile";

export function foobarCloudFailureLabel(operation: FoobarCloudFailedOperation): string {
	if (operation === "load") return "Could not check your cloud save.";
	if (operation === "sync") return "Could not save your latest progress.";
	if (operation === "delete") return "Could not delete your cloud save.";
	if (operation === "enable") return "Could not turn cloud saving back on.";
	return "Could not update your leaderboard preference.";
}
