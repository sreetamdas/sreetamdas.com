/**
 * HTML for the 1200x630 certificate share card, rendered by workers-og
 * (satori). It mirrors the certificate page: the fully lit mountain with each
 * discovery's real star, in Iosevka on Karma.
 *
 * Satori does no shaping and never falls back by itself, so every fixed string
 * here stays inside the Iosevka subset (see FOOBAR_CARD_SUBSET); a hunter name
 * outside it gets a fallback font from the route.
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

const KARMA = {
	background: "#0a0e14",
	foreground: "#f7f1ff",
	comment: "#8d8a96",
	gutter: "#444444",
	yellow: "#fce566",
	silver: "#a9a9c8",
	orange: "#fd9353",
	lavender: "#af98e6",
} as const;

const TIER_COLOR: Record<FoobarTier, string> = {
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

export function renderFoobarCertificateCard(certificate: FoobarCertificate): string {
	const stars = Object.values(certificate.stars);
	const gold = stars.filter((star) => star === "gold").length;
	const silver = stars.filter((star) => star === "silver").length;
	const date = formatFoobarCertificateDate(certificate.completedAt);
	const words = PUZZLE_TIERS.map(
		(tier, index) =>
			`${index > 0 ? span(", ", KARMA.comment) : ""}${span(FOOBAR_PUZZLE_TIER_WORDS[tier], TIER_COLOR[tier])}`,
	).join("");

	return `<div style="display:flex;flex-direction:column;width:1200px;height:630px;padding:52px 64px;background:${KARMA.background};color:${KARMA.foreground};font-family:Iosevka">
		<div style="display:flex;justify-content:space-between;font-size:22px;color:${KARMA.comment}">${span("sreetamdas.com/foobar", TIER_COLOR.discovery)}<span>--- field certificate ---</span></div>
		<div style="display:flex;flex:1;justify-content:space-between;align-items:center">
			<div style="display:flex;flex-direction:column;width:640px">
				<div style="display:flex;font-size:24px;color:${KARMA.comment}">Certifies that</div>
				<div style="display:flex;margin-top:8px;font-size:64px;font-weight:700;line-height:1.1;color:${TIER_COLOR.discovery}">${escapeHtml(certificate.name)}</div>
				<div style="display:flex;margin-top:18px;font-size:26px;line-height:1.4">mapped every hidden corner and completed the Foobar hunt.</div>
				<div style="display:flex;margin-top:24px;font-size:24px;white-space:pre">${span("{", KARMA.comment)}${words}${span("}", KARMA.comment)}</div>
				<div style="display:flex;margin-top:18px;font-size:26px;white-space:pre">${span(`${stars.length}*`, KARMA.yellow)}${span(" · ", KARMA.comment)}${span(`${gold} gold`, KARMA.yellow)}${span(" · ", KARMA.comment)}${span(`${silver} silver`, KARMA.silver)}</div>
				<div style="display:flex;margin-top:18px;font-size:22px;color:${KARMA.comment}">Completed ${escapeHtml(date)}</div>
			</div>
			<div style="display:flex;flex-direction:column;font-size:13px;line-height:1.2">${mountainRows(certificate)}</div>
		</div>
	</div>`.replaceAll(/>\s*\n\s*</g, "><");
}

function mountainRows({ stars }: FoobarCertificate): string {
	const campfireLit = "campfire" in stars;
	const flag = row(FOOBAR_MOUNTAIN.flag, (cell) =>
		cell.kind === "flag" ? KARMA.lavender : undefined,
	);
	const rows = FOOBAR_MOUNTAIN.rows.map(({ achievement, cells }) => {
		const star = stars[achievement];
		const color = TIER_COLOR[FOOBAR_ACHIEVEMENTS[achievement].tier];
		const art = row(
			cells,
			(cell) => {
				if (!star) return cell.kind === "waypoint" ? KARMA.gutter : "#2a2f37";
				if (cell.kind === "waypoint") return KARMA.foreground;
				return cell.kind === "trail" ? KARMA.comment : color;
			},
			star ? span(" *", star === "gold" ? KARMA.yellow : KARMA.silver) : "",
		);
		return art;
	});
	const basecamp = FOOBAR_MOUNTAIN.basecamp.map((cells) =>
		row(cells, (cell) => {
			if (cell.kind === "fire") return campfireLit ? KARMA.orange : "#2a2f37";
			return cell.kind === "tent" ? KARMA.comment : "#2a2f37";
		}),
	);
	return [flag, ...rows, ...basecamp].join("");
}

function row(
	cells: ReadonlyArray<FoobarMountainCell>,
	colorFor: (cell: FoobarMountainCell) => string | undefined,
	suffix = "",
): string {
	let html = "";
	let color: string | undefined;
	let text = "";
	const flush = () => {
		if (text) html += span(text, color);
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
	return `<div style="display:flex;white-space:pre">${html}${suffix}</div>`;
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
