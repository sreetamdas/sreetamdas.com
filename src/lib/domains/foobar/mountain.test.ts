import { describe, expect, test } from "vitest";

import { FOOBAR_ACHIEVEMENT_ORDER } from "./catalog";
import { buildFoobarMountain, FOOBAR_MOUNTAIN, FOOBAR_MOUNTAIN_WIDTH } from "./mountain";

describe("Foobar mountain", () => {
	test("draws one row per achievement, summit first", () => {
		expect(FOOBAR_MOUNTAIN.rows.map((row) => row.achievement)).toEqual(
			FOOBAR_ACHIEVEMENT_ORDER.toReversed(),
		);
	});

	test("keeps every row at the fixed width", () => {
		const rows = [FOOBAR_MOUNTAIN.flag, ...FOOBAR_MOUNTAIN.rows.map((row) => row.cells)];
		for (const cells of [...rows, ...FOOBAR_MOUNTAIN.basecamp]) {
			expect(cells).toHaveLength(FOOBAR_MOUNTAIN_WIDTH);
			expect(cells.every((cell) => cell.char.length === 1)).toBe(true);
		}
	});

	test("puts exactly one waypoint between the slopes of each row", () => {
		for (const { cells } of FOOBAR_MOUNTAIN.rows) {
			const kinds = cells.map((cell) => cell.kind);
			const left = kinds.indexOf("edge");
			const right = kinds.lastIndexOf("edge");
			const waypoints = kinds.flatMap((kind, index) => (kind === "waypoint" ? [index] : []));

			expect(left).toBeLessThan(right);
			expect(waypoints).toHaveLength(1);
			expect(waypoints[0]).toBeGreaterThan(left);
			expect(waypoints[0]).toBeLessThan(right);
		}
	});

	test("uses only printable ASCII the shipped Iosevka subset covers", () => {
		const chars = [
			...FOOBAR_MOUNTAIN.flag,
			...FOOBAR_MOUNTAIN.rows.flatMap((row) => row.cells),
			...FOOBAR_MOUNTAIN.basecamp.flat(),
		].map((cell) => cell.char.codePointAt(0) ?? 0);

		expect(chars.every((code) => code >= 0x20 && code <= 0x7e)).toBe(true);
	});

	test("draws the same picture every time", () => {
		expect(buildFoobarMountain()).toEqual(FOOBAR_MOUNTAIN);
	});
});
