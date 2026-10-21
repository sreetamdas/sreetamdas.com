/**
 * The ASCII mountain behind the /foobar dashboard, certificate and share card.
 * Each achievement owns one row, summit (last in catalogue order) at the top
 * and the first discovery just above Basecamp, so difficulty reads as altitude.
 *
 * The picture is generated from the catalogue with a fixed seed and never from
 * progress: progress only decides how a row is coloured, so the art stays put
 * as it fills in, and adding an achievement simply makes the mountain taller.
 */
import {
	FOOBAR_ACHIEVEMENT_ORDER,
	FOOBAR_ACHIEVEMENTS,
	type FoobarAchievement,
	type FoobarTier,
} from "./catalog";

export const FOOBAR_MOUNTAIN_WIDTH = 44;
const CENTER = 21;
const SEED = 42;

export type FoobarMountainCellKind =
	| "space"
	| "edge"
	| "texture"
	| "trail"
	| "waypoint"
	| "flag"
	| "tent"
	| "fire"
	| "ground";

export type FoobarMountainCell = { char: string; kind: FoobarMountainCellKind };

export type FoobarMountainRow = {
	achievement: FoobarAchievement;
	cells: Array<FoobarMountainCell>;
};

export type FoobarMountain = {
	flag: Array<FoobarMountainCell>;
	rows: Array<FoobarMountainRow>;
	basecamp: Array<Array<FoobarMountainCell>>;
};

// Two-character entries are placed as a pair ("[]" reads as a ruin).
const TIER_TEXTURE: Record<FoobarTier, { chars: ReadonlyArray<string>; density: number }> = {
	discovery: { chars: [",", ";", "'", ","], density: 0.28 },
	browser: { chars: ["^", "^", "^", "'"], density: 0.36 },
	archaeology: { chars: ["[]", "=", "|"], density: 0.22 },
	protocol: { chars: ["'", "`", "~"], density: 0.3 },
	meta: { chars: [], density: 0 },
};

const BASECAMP_ROWS = [
	"         /\\          ) (                    ",
	"        /__\\   ~~   (   )   ~~              ",
	"____________________________________________",
];

function createRandom(seed: number) {
	let state = seed;
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let value = Math.imul(state ^ (state >>> 15), 1 | state);
		value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	};
}

function clamp(value: number, min: number, max: number) {
	return Math.max(Math.max(0, min), Math.min(max, value));
}

function blankRow(): Array<FoobarMountainCell> {
	return Array.from({ length: FOOBAR_MOUNTAIN_WIDTH }, () => ({ char: " ", kind: "space" }));
}

function basecampKind(char: string, column: number): FoobarMountainCellKind {
	if (char === " ") return "space";
	if (char === "_" || char === "~") return "ground";
	if (char === "(" || char === ")") return "fire";
	return column < 14 ? "tent" : "ground";
}

export function buildFoobarMountain(): FoobarMountain {
	const random = createRandom(SEED);
	let previousTrail = CENTER;
	let previousLeft = CENTER;
	let previousRight = CENTER;

	const rows = FOOBAR_ACHIEVEMENT_ORDER.toReversed().map((achievement, index) => {
		const halfWidth = 1 + index * 0.84;
		const jagLeft = index < 2 ? 0 : 1.3 * Math.sin(index * 0.9) + 0.8 * Math.sin(index * 2.3 + 1);
		const jagRight = index < 2 ? 0 : 1.6 * Math.sin(index * 0.65 + 2) + 0.7 * Math.sin(index * 1.9);
		// Each row is at least as wide as the one above and at most two columns
		// wider per side, so the slopes stay rough without folding back inward.
		const left = clamp(Math.round(CENTER - halfWidth - jagLeft), previousLeft - 2, previousLeft);
		const right = clamp(
			Math.round(CENTER + halfWidth * 0.96 + jagRight),
			previousRight,
			Math.min(FOOBAR_MOUNTAIN_WIDTH - 1, previousRight + 2),
		);
		previousLeft = left;
		previousRight = right;
		const cells = blankRow();
		cells[left] = { char: "/", kind: "edge" };
		cells[right] = { char: "\\", kind: "edge" };

		const texture = TIER_TEXTURE[FOOBAR_ACHIEVEMENTS[achievement].tier];
		for (let column = left + 1; column < right; column++) {
			if (random() >= texture.density) continue;
			const chars = texture.chars[Math.floor(random() * texture.chars.length)];
			if (chars === undefined) continue;
			const [first, second] = chars;
			if (second === undefined) {
				cells[column] = { char: chars, kind: "texture" };
			} else if (column + 1 < right && first !== undefined) {
				cells[column] = { char: first, kind: "texture" };
				cells[column + 1] = { char: second, kind: "texture" };
				column++;
			}
		}

		// Switchbacks: a triangle wave across the slope, joined to the row above.
		const phase = (index % 6) / 6;
		const wave = phase < 0.5 ? phase * 4 - 1 : 3 - phase * 4;
		const trail = Math.max(
			left + 1,
			Math.min(right - 1, Math.round(CENTER + halfWidth * 0.62 * wave)),
		);
		const from = Math.max(Math.min(previousTrail, trail), left + 1);
		const to = Math.min(Math.max(previousTrail, trail), right - 1);
		for (let column = from; column <= to; column++) cells[column] = { char: ".", kind: "trail" };
		cells[trail] = { char: "o", kind: "waypoint" };
		previousTrail = trail;

		return { achievement, cells };
	});

	const flag = blankRow();
	flag[CENTER] = { char: "|", kind: "flag" };
	flag[CENTER + 1] = { char: ">", kind: "flag" };
	flag[CENTER + 2] = { char: "~", kind: "flag" };

	const basecamp = BASECAMP_ROWS.map((line) =>
		Array.from(
			line.padEnd(FOOBAR_MOUNTAIN_WIDTH).slice(0, FOOBAR_MOUNTAIN_WIDTH),
			(char, column) => ({
				char,
				kind: basecampKind(char, column),
			}),
		),
	);

	return { flag, rows, basecamp };
}

export const FOOBAR_MOUNTAIN = buildFoobarMountain();
