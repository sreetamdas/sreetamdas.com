import { describe, expect, test, vi } from "vitest";

import { handleFoobarCertificateImage } from "./$token/og[.]png";

describe("Foobar certificate image", () => {
	test("returns 404 for an unknown or malformed certificate", async () => {
		const resolve = vi.fn().mockResolvedValue(null);
		const render = vi.fn();

		expect((await handleFoobarCertificateImage("bad token", resolve, render)).status).toBe(404);
		expect((await handleFoobarCertificateImage("missing", resolve, render)).status).toBe(404);
		expect(render).not.toHaveBeenCalled();
	});

	test("renders escaped public certificate data as a cacheable PNG", async () => {
		const resolve = vi.fn().mockResolvedValue({
			name: "Ada <script>",
			completedAt: Date.UTC(2026, 6, 16),
			certificateId: "cert-a",
			stars: { headers: "silver", teapot: "gold" },
		});
		const render = vi.fn(
			(html: string) => new Response(html, { headers: { "Content-Type": "image/png" } }),
		);

		const response = await handleFoobarCertificateImage("cert-a", resolve, render);
		expect(response.headers.get("Content-Type")).toBe("image/png");
		expect(response.headers.get("Cache-Control")).toBe("public, max-age=3600");
		expect(render).toHaveBeenCalledWith(expect.stringContaining("Ada &lt;script>"));
		expect(render).toHaveBeenCalledWith(expect.stringContaining("width:1200px;height:630px"));
		expect(render).toHaveBeenCalledWith(expect.stringContaining("1 silver"));
	});
});
