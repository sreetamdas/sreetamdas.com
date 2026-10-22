/**
 * The certificate as terminal text for `curl`: the same content as the share
 * card (certificate-card.ts shapes the runs), painted with 24-bit ANSI colour
 * in Karma, or left bare when colour is off.
 *
 * The hunter name is user input, so every control character (C0, DEL, C1,
 * including ESC) is stripped before it is printed, and it is cut to keep every
 * line within 80 columns.
 */
import { absoluteUrl } from "@/lib/seo";

import { type FoobarCertificate } from "./certificate";
import {
	type FoobarCardRun,
	getFoobarCertificateMountain,
	getFoobarCertificateSummary,
	KARMA,
	TIER_COLOR,
} from "./certificate-card";

const HEADER_WIDTH = 64;
const NAME_INDENT = "  ";
const NAME_WIDTH = 80 - NAME_INDENT.length;
const RESET = "\x1b[0m";

// East Asian wide and emoji graphemes take two columns, anything else one.
const WIDE_CHAR =
	/[\u{1100}-\u{115f}\u{2e80}-\u{a4cf}\u{ac00}-\u{d7a3}\u{f900}-\u{faff}\u{fe30}-\u{fe4f}\u{ff00}-\u{ff60}\u{ffe0}-\u{ffe6}\u{1f300}-\u{1f64f}\u{1f900}-\u{1f9ff}\u{20000}-\u{3fffd}]/u;

export function renderFoobarCertificateText(
	certificate: FoobarCertificate,
	{ color }: { color: boolean },
): string {
	const paint = (runs: ReadonlyArray<FoobarCardRun>) =>
		runs
			.map((run) => (color && run.color ? `${sgr(run.color)}${run.text}\x1b[39m` : run.text))
			.join("");
	const { words, split, date } = getFoobarCertificateSummary(certificate);
	const site = "sreetamdas.com/foobar";
	const title = "--- field certificate ---";
	const name = fitName(sanitizeFoobarName(certificate.name));
	const url = absoluteUrl(`/foobar/certificate/${certificate.certificateId}`);

	const lines = [
		paint([
			{ text: site, color: TIER_COLOR.discovery },
			{ text: " ".repeat(HEADER_WIDTH - site.length - title.length), color: undefined },
			{ text: title, color: KARMA.comment },
		]),
		"",
		paint([{ text: "Certifies that", color: KARMA.comment }]),
		`${NAME_INDENT}${color ? `\x1b[1m${sgr(TIER_COLOR.discovery)}${name}\x1b[22;39m` : name}`,
		"mapped every hidden corner and completed the Foobar hunt.",
		"",
		paint(words),
		paint(split),
		"",
		...getFoobarCertificateMountain(certificate).map(paint),
		"",
		paint([{ text: `Completed ${date}`, color: KARMA.comment }]),
		"",
		paint([{ text: url, color: TIER_COLOR.discovery }]),
	];
	return `${lines.join("\n")}${color ? RESET : ""}\n`;
}

/** Drops C0, DEL and C1 controls (ESC among them) so a name cannot drive the terminal. */
export function sanitizeFoobarName(name: string): string {
	return name.replaceAll(/\p{Cc}/gu, "");
}

function fitName(name: string): string {
	const graphemes = Array.from(new Intl.Segmenter().segment(name), ({ segment }) => segment);
	const widthOf = (grapheme: string) => (WIDE_CHAR.test(grapheme) ? 2 : 1);
	if (graphemes.reduce((width, grapheme) => width + widthOf(grapheme), 0) <= NAME_WIDTH) {
		return name;
	}
	let width = 1;
	let fitted = "";
	for (const grapheme of graphemes) {
		width += widthOf(grapheme);
		if (width > NAME_WIDTH) break;
		fitted += grapheme;
	}
	return `${fitted}…`;
}

function sgr(hex: string): string {
	const value = Number.parseInt(hex.slice(1), 16);
	return `\x1b[38;2;${(value >> 16) & 0xff};${(value >> 8) & 0xff};${value & 0xff}m`;
}
