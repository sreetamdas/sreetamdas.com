import { describe, expect, test } from "vitest";

import {
	FOOBAR_HINT_DEVELOPMENT_MS,
	formatFoobarHintRemaining,
	getFoobarHintDevelopment,
	getFoobarHintElapsedBucket,
} from "./hint-development";

const MINUTE_MS = 60 * 1_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

describe("Foobar hint development", () => {
	test("treats an unseen third hint as not started", () => {
		expect(getFoobarHintDevelopment(undefined, 0)).toEqual({ status: "not-started" });
	});

	test("treats a historical null timestamp as immediately ready", () => {
		expect(getFoobarHintDevelopment(null, 0)).toEqual({ status: "ready", availableAt: null });
	});

	test("develops from the seen timestamp until one millisecond before the deadline", () => {
		const seenAt = 1_000;
		const availableAt = seenAt + FOOBAR_HINT_DEVELOPMENT_MS;

		expect(FOOBAR_HINT_DEVELOPMENT_MS).toBe(24 * 60 * 60 * 1_000);
		expect(getFoobarHintDevelopment(seenAt, seenAt)).toEqual({
			status: "developing",
			availableAt,
			remainingMs: FOOBAR_HINT_DEVELOPMENT_MS,
		});
		expect(getFoobarHintDevelopment(seenAt, availableAt - 1)).toEqual({
			status: "developing",
			availableAt,
			remainingMs: 1,
		});
	});

	test("is ready at the deadline and afterward", () => {
		const seenAt = 1_000;
		const availableAt = seenAt + FOOBAR_HINT_DEVELOPMENT_MS;

		expect(getFoobarHintDevelopment(seenAt, availableAt)).toEqual({
			status: "ready",
			availableAt,
		});
		expect(getFoobarHintDevelopment(seenAt, availableAt + 1)).toEqual({
			status: "ready",
			availableAt,
		});
	});

	test("formats remaining time by rounding up to at least one minute", () => {
		expect(formatFoobarHintRemaining(24 * HOUR_MS)).toBe("24h 0m");
		expect(formatFoobarHintRemaining(61 * MINUTE_MS)).toBe("1h 1m");
		expect(formatFoobarHintRemaining(1)).toBe("1m");
	});

	test("buckets elapsed time after hint maturity", () => {
		const now = 10 * DAY_MS;

		expect(getFoobarHintElapsedBucket(null, now)).toBe("legacy");
		expect(getFoobarHintElapsedBucket(now - DAY_MS, now)).toBe("24-48h");
		expect(getFoobarHintElapsedBucket(now - (2 * DAY_MS - 1), now)).toBe("24-48h");
		expect(getFoobarHintElapsedBucket(now - 2 * DAY_MS, now)).toBe("2-7d");
		expect(getFoobarHintElapsedBucket(now - (8 * DAY_MS - 1), now)).toBe("2-7d");
		expect(getFoobarHintElapsedBucket(now - 8 * DAY_MS, now)).toBe("8d+");
	});
});
