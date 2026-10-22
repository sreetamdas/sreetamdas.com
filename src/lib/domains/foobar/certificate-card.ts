/**
 * HTML for the 1200x630 certificate share card, rendered by workers-og
 * (satori). It mirrors the certificate page: the fully lit mountain with each
 * discovery's real star, in Iosevka on Karma.
 *
 * Satori does no shaping and never falls back by itself, so every fixed string
 * here stays inside the Iosevka subset (see FOOBAR_CARD_SUBSET); a hunter name
 * outside it gets a fallback font from the route.
 *
 * The tier words, star split and mountain are shaped as coloured runs, which
 * certificate-text.ts paints again as ANSI for terminals.
 */
import {
	FOOBAR_ACHIEVEMENTS,
	FOOBAR_PUZZLE_TIER_WORDS,
	type FoobarPuzzleTier,
	type FoobarTier,
} from "./catalog";
import { formatFoobarCertificateDate, type FoobarCertificate } from "./certificate";
import { FOOBAR_MOUNTAIN, type FoobarMountainCell } from "./mountain";

/** Codepoints the shipped Iosevka subset covers (.config/iosevka-build-plan.toml). */
export const FOOBAR_CARD_SUBSET = /^[\r\x20-\x7e\xa0-\xbb\xd7]*$/u;
export const FOOBAR_CARD_SUBSET_CHAR = /[\r\x20-\x7e\xa0-\xbb\xd7]/gu;

export const KARMA = {
	background: "#0a0e14",
	foreground: "#f7f1ff",
	comment: "#8d8a96",
	gutter: "#444444",
	yellow: "#fce566",
	silver: "#a9a9c8",
	orange: "#fd9353",
	lavender: "#af98e6",
} as const;

export const TIER_COLOR: Record<FoobarTier, string> = {
	discovery: "#7bd88f",
	browser: "#5ad4e6",
	archaeology: "#fce566",
	protocol: "#fc618d",
	meta: KARMA.lavender,
};

const PUZZLE_TIERS: ReadonlyArray<FoobarPuzzleTier> = [
	"discovery",
	"browser",
	"archaeology",
	"protocol",
];

/** Text drawn in one colour; an undefined colour inherits the surrounding text's. */
export type FoobarCardRun = { text: string; color: string | undefined };

export function getFoobarCertificateSummary(certificate: FoobarCertificate) {
	const stars = Object.values(certificate.stars);
	const gold = stars.filter((star) => star === "gold").length;
	const silver = stars.filter((star) => star === "silver").length;
	const words: Array<FoobarCardRun> = [
		{ text: "{", color: KARMA.comment },
		...PUZZLE_TIERS.flatMap((tier, index) => [
			...(index > 0 ? [{ text: ", ", color: KARMA.comment }] : []),
			{ text: FOOBAR_PUZZLE_TIER_WORDS[tier], color: TIER_COLOR[tier] },
		]),
		{ text: "}", color: KARMA.comment },
	];
	const split: Array<FoobarCardRun> = [
		{ text: `${stars.length}*`, color: KARMA.yellow },
		{ text: " · ", color: KARMA.comment },
		{ text: `${gold} gold`, color: KARMA.yellow },
		{ text: " · ", color: KARMA.comment },
		{ text: `${silver} silver`, color: KARMA.silver },
	];
	return { words, split, date: formatFoobarCertificateDate(certificate.completedAt) };
}

export function renderFoobarCertificateCard(certificate: FoobarCertificate): string {
	const { words, split, date } = getFoobarCertificateSummary(certificate);
	const mountain = getFoobarCertificateMountain(certificate)
		.map((line) => `<div style="display:flex;white-space:pre">${spans(line)}</div>`)
		.join("");

	return `<div style="display:flex;flex-direction:column;width:1200px;height:630px;padding:52px 64px;background:${KARMA.background};color:${KARMA.foreground};font-family:Iosevka">
		<div style="display:flex;justify-content:space-between;font-size:22px;color:${KARMA.comment}">${span("sreetamdas.com/foobar", TIER_COLOR.discovery)}<span>--- field certificate ---</span></div>
		<div style="display:flex;flex:1;justify-content:space-between;align-items:center">
			<div style="display:flex;flex-direction:column;width:640px">
				<div style="display:flex;font-size:24px;color:${KARMA.comment}">Certifies that</div>
				<div style="display:flex;margin-top:8px;font-size:64px;font-weight:700;line-height:1.1;color:${TIER_COLOR.discovery}">${escapeHtml(certificate.name)}</div>
				<div style="display:flex;margin-top:18px;font-size:26px;line-height:1.4">mapped every hidden corner and completed the Foobar hunt.</div>
				<div style="display:flex;margin-top:24px;font-size:24px;white-space:pre">${spans(words)}</div>
				<div style="display:flex;margin-top:18px;font-size:26px;white-space:pre">${spans(split)}</div>
				<div style="display:flex;margin-top:18px;font-size:22px;color:${KARMA.comment}">Completed ${escapeHtml(date)}</div>
			</div>
			<div style="display:flex;flex-direction:column;font-size:13px;line-height:1.2">${mountain}</div>
		</div>
	</div>`.replaceAll(/>\s*\n\s*</g, "><");
}

/** The flag, one line per discovery with its real star, then Basecamp. */
export function getFoobarCertificateMountain({
	stars,
}: Pick<FoobarCertificate, "stars">): Array<Array<FoobarCardRun>> {
	const campfireLit = "campfire" in stars;
	const flag = row(FOOBAR_MOUNTAIN.flag, (cell) =>
		cell.kind === "flag" ? KARMA.lavender : undefined,
	);
	const rows = FOOBAR_MOUNTAIN.rows.map(({ achievement, cells }) => {
		const star = stars[achievement];
		const color = TIER_COLOR[FOOBAR_ACHIEVEMENTS[achievement].tier];
		const art = row(cells, (cell) => {
			if (!star) return cell.kind === "waypoint" ? KARMA.gutter : "#2a2f37";
			if (cell.kind === "waypoint") return KARMA.foreground;
			return cell.kind === "trail" ? KARMA.comment : color;
		});
		return star
			? [...art, { text: " *", color: star === "gold" ? KARMA.yellow : KARMA.silver }]
			: art;
	});
	const basecamp = FOOBAR_MOUNTAIN.basecamp.map((cells) =>
		row(cells, (cell) => {
			if (cell.kind === "fire") return campfireLit ? KARMA.orange : "#2a2f37";
			return cell.kind === "tent" ? KARMA.comment : "#2a2f37";
		}),
	);
	return [flag, ...rows, ...basecamp];
}

function row(
	cells: ReadonlyArray<FoobarMountainCell>,
	colorFor: (cell: FoobarMountainCell) => string | undefined,
): Array<FoobarCardRun> {
	const runs: Array<FoobarCardRun> = [];
	let color: string | undefined;
	let text = "";
	const flush = () => {
		if (text) runs.push({ text, color });
		text = "";
	};
	for (const cell of cells) {
		const next = cell.kind === "space" ? color : colorFor(cell);
		if (next !== color) {
			flush();
			color = next;
		}
		text += cell.char;
	}
	flush();
	return runs;
}

function spans(runs: ReadonlyArray<FoobarCardRun>): string {
	return runs.map(({ text, color }) => span(text, color)).join("");
}

function span(text: string, color: string | undefined): string {
	return color
		? `<span style="color:${color}">${escapeHtml(text)}</span>`
		: `<span>${escapeHtml(text)}</span>`;
}

// workers-og hands text to satori without decoding entities, so escape only
// what HTML parsing requires: "&#39;" would otherwise be drawn literally.
function escapeHtml(value: string): string {
	return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
}
