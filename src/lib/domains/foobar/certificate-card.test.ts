import { describe, expect, test } from "vitest";

import {
	FOOBAR_ACHIEVEMENT_ORDER,
	FOOBAR_REQUIRED_ACHIEVEMENTS,
	type FoobarStars,
} from "./catalog";
import { FOOBAR_CARD_SUBSET, renderFoobarCertificateCard } from "./certificate-card";

const stars: FoobarStars = Object.fromEntries(
	FOOBAR_REQUIRED_ACHIEVEMENTS.map((achievement) => [
		achievement,
		achievement === "headers" ? "silver" : "gold",
	]),
);
const certificate = {
	name: "Ada <script>",
	completedAt: Date.UTC(2026, 6, 16),
	certificateId: "cert-a",
	stars,
};

function visibleText(html: string) {
	return html
		.replaceAll(/<[^>]+>/g, "")
		.replaceAll("&lt;", "<")
		.replaceAll("&amp;", "&");
}

describe("Foobar certificate card", () => {
	test("renders a 1200x630 card with the escaped name", () => {
		const html = renderFoobarCertificateCard(certificate);

		expect(html).toContain("width:1200px;height:630px");
		expect(html).toContain("Ada &lt;script>");
		expect(html).not.toContain("<script>");
	});

	test("shows the star total and the gold/silver split", () => {
		const text = visibleText(renderFoobarCertificateCard(certificate));

		expect(text).toContain(`${FOOBAR_REQUIRED_ACHIEVEMENTS.length}*`);
		expect(text).toContain(`${FOOBAR_REQUIRED_ACHIEVEMENTS.length - 1} gold`);
		expect(text).toContain("1 silver");
		expect(text).toContain("draco, dormiens, nunquam, titillandus");
		expect(text).toContain("Completed July 16, 2026");
	});

	test("never draws an entity that satori would show literally", () => {
		const html = renderFoobarCertificateCard({ ...certificate, name: "Zoë O'Brien & co" });

		expect(html).not.toMatch(/&(#\d+|gt|quot);/);
		expect(html).toContain("O'Brien &amp; co");
	});

	test("draws the flag, one line per discovery and Basecamp", () => {
		const lines =
			renderFoobarCertificateCard(certificate).match(
				/<div style="display:flex;white-space:pre">/g,
			) ?? [];

		expect(lines).toHaveLength(1 + FOOBAR_ACHIEVEMENT_ORDER.length + 3);
	});

	test("keeps every fixed character inside the Iosevka subset", () => {
		const text = visibleText(renderFoobarCertificateCard(certificate)).replace(
			certificate.name,
			"",
		);

		expect(text).toMatch(FOOBAR_CARD_SUBSET);
		expect("Ada Lovelace").toMatch(FOOBAR_CARD_SUBSET);
		expect("Zoë 李").not.toMatch(FOOBAR_CARD_SUBSET);
	});
});
