import { describe, expect, test, vi } from "vitest";

vi.mock("@/config", () => ({
	SITE_OG_IMAGE: "/og-image.png",
	SITE_URL: "https://sreetamdas.com",
}));

import { FOOBAR_REQUIRED_ACHIEVEMENTS, type FoobarStars } from "./catalog";
import { renderFoobarCertificateText, sanitizeFoobarName } from "./certificate-text";

const stars: FoobarStars = Object.fromEntries(
	FOOBAR_REQUIRED_ACHIEVEMENTS.map((achievement) => [
		achievement,
		achievement === "headers" ? "silver" : "gold",
	]),
);
const certificate = {
	name: "Ada Lovelace",
	completedAt: Date.UTC(2026, 6, 16),
	certificateId: "0f8fad5b-d9cb-469f-a165-70867728950e",
	stars,
};

const ESC = "\x1b";

function lines(text: string) {
	return text.replace(/\n$/, "").split("\n");
}

function columns(line: string) {
	return Array.from(new Intl.Segmenter().segment(line), ({ segment }) =>
		/\p{sc=Han}/u.test(segment) ? 2 : 1,
	).reduce((sum, width) => sum + width, 0);
}

describe("Foobar certificate text", () => {
	test("prints the certificate without colour", () => {
		expect(renderFoobarCertificateText(certificate, { color: false })).toMatchSnapshot();
	});

	test("shows the same summary as the share card", () => {
		const text = renderFoobarCertificateText(certificate, { color: false });

		expect(text).toContain("  Ada Lovelace\n");
		expect(text).toContain("{draco, dormiens, nunquam, titillandus}");
		expect(text).toContain(
			`${FOOBAR_REQUIRED_ACHIEVEMENTS.length}* · ${FOOBAR_REQUIRED_ACHIEVEMENTS.length - 1} gold · 1 silver`,
		);
		expect(text).toContain("Completed July 16, 2026");
		expect(
			text
				.trimEnd()
				.endsWith(`https://sreetamdas.com/foobar/certificate/${certificate.certificateId}`),
		).toBe(true);
	});

	test("emits escapes only when colour is on, and ends with a reset", () => {
		const plain = renderFoobarCertificateText(certificate, { color: false });
		const colored = renderFoobarCertificateText(certificate, { color: true });

		expect(plain).not.toContain(ESC);
		expect(plain.endsWith("\n")).toBe(true);
		expect(colored).toContain("\x1b[38;2;123;216;143m");
		expect(colored.endsWith("\x1b[0m\n")).toBe(true);
		expect(colored.replaceAll(new RegExp(`${ESC}\\[[\\d;]*m`, "g"), "")).toBe(plain);
	});

	test("strips control characters from the name", () => {
		const name = "Ada\x1b[2J\x1b]0;pwned\x07\u009b31m\r\n\x7fLovelace";
		const text = renderFoobarCertificateText({ ...certificate, name }, { color: false });

		expect(sanitizeFoobarName(name)).toBe("Ada[2J]0;pwned31mLovelace");
		expect(text).not.toMatch(/[^\P{Cc}\n]/u);
	});

	test("keeps every line within 80 columns", () => {
		for (const name of ["Ada Lovelace", "A".repeat(200), "李".repeat(60), "e\u0301".repeat(90)]) {
			const output = renderFoobarCertificateText({ ...certificate, name }, { color: false });
			for (const line of lines(output)) {
				expect(columns(line)).toBeLessThanOrEqual(80);
			}
		}
		expect(
			renderFoobarCertificateText({ ...certificate, name: "A".repeat(200) }, { color: false }),
		).toContain(`  ${"A".repeat(77)}…\n`);
	});
});
