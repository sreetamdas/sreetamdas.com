import { describe, expect, test, vi } from "vitest";

vi.mock("@/config", () => ({
	SITE_OG_IMAGE: "/og-image.png",
	SITE_URL: "https://example.com",
}));

import { createFoobarCertificateHead, formatFoobarCertificateDate } from "./certificate";

describe("Foobar certificate presentation", () => {
	test("builds public canonical and generated image metadata", () => {
		const head = createFoobarCertificateHead({
			name: "Ada",
			completedAt: Date.UTC(2026, 6, 16),
			certificateId: "cert-a",
		});

		expect(head.links).toEqual([
			{ rel: "canonical", href: "https://example.com/foobar/certificate/cert-a" },
		]);
		expect(head.meta).toContainEqual({
			property: "og:image",
			content: "https://example.com/api/foobar/certificate/cert-a/og.png",
		});
		expect(head.meta).toContainEqual({ property: "og:title", content: "Ada completed Foobar" });
	});

	test("formats completion dates deterministically in UTC", () => {
		expect(formatFoobarCertificateDate(Date.UTC(2026, 6, 16, 23, 30))).toBe("July 16, 2026");
	});
});
