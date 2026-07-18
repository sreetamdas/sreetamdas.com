/**
 * Pure timing policy for Foobar hint development; persistence remains in the clue log.
 */

const MINUTE_MS = 60 * 1_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export const FOOBAR_HINT_DEVELOPMENT_MS = DAY_MS;

export type FoobarHintDevelopment =
	| { status: "not-started" }
	| { status: "developing"; availableAt: number; remainingMs: number }
	| { status: "ready"; availableAt: number | null };

export type FoobarHintElapsedBucket = "24-48h" | "2-7d" | "8d+" | "legacy";

export function getFoobarHintDevelopment(
	seenAt: number | null | undefined,
	now: number,
): FoobarHintDevelopment {
	if (seenAt === undefined) return { status: "not-started" };
	if (seenAt === null) return { status: "ready", availableAt: null };

	const availableAt = seenAt + FOOBAR_HINT_DEVELOPMENT_MS;
	if (now >= availableAt) return { status: "ready", availableAt };

	return { status: "developing", availableAt, remainingMs: availableAt - now };
}

export function formatFoobarHintRemaining(remainingMs: number): string {
	const totalMinutes = Math.max(1, Math.ceil(remainingMs / MINUTE_MS));
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function getFoobarHintElapsedBucket(
	seenAt: number | null,
	now: number,
): FoobarHintElapsedBucket {
	if (seenAt === null) return "legacy";

	const elapsedMs = now - seenAt;
	if (elapsedMs < 2 * DAY_MS) return "24-48h";
	if (elapsedMs < 8 * DAY_MS) return "2-7d";
	return "8d+";
}
