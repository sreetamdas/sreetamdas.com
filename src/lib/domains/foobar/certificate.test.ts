import { describe, expect, test } from "vitest";

import { createFoobarCertificateHead, formatFoobarCertificateDate } from "./certificate";

describe("Foobar certificate presentation", () => {
	test("builds public canonical and generated image metadata", () => {
		const head = createFoobarCertificateHead({
			name: "Ada",
			completedAt: Date.UTC(2026, 6, 16),
			certificateId: "cert-a",
		});

		expect(head.links).toEqual([
			{ rel: "canonical", href: "http://localhost:5045/foobar/certificate/cert-a" },
		]);
		expect(head.meta).toContainEqual({
			property: "og:image",
			content: "http://localhost:5045/api/foobar/certificate/cert-a/og.png",
		});
		expect(head.meta).toContainEqual({ property: "og:title", content: "Ada completed Foobar" });
	});

	test("formats completion dates deterministically in UTC", () => {
		expect(formatFoobarCertificateDate(Date.UTC(2026, 6, 16, 23, 30))).toBe("July 16, 2026");
	});
});
