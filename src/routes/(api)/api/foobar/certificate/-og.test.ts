import { describe, expect, test, vi } from "vitest";

import { handleFoobarCertificateImage } from "./$token/og[.]png";

const certificate = {
	name: "Ada <script>",
	completedAt: Date.UTC(2026, 6, 16),
	certificateId: "cert-a",
	stars: { headers: "silver", teapot: "gold" },
};

function cardRequest(token: string) {
	return new Request(`https://sreetamdas.com/api/foobar/certificate/${token}/og.png`, {
		headers: { "User-Agent": "Twitterbot/1.0" },
	});
}

function emptyCache() {
	return {
		match: vi.fn().mockResolvedValue(undefined),
		put: vi.fn(async (_key: Request, _response: Response) => {}),
	};
}

describe("Foobar certificate image", () => {
	test("returns 404 for an unknown or malformed certificate, and never caches it", async () => {
		const resolve = vi.fn().mockResolvedValue(null);
		const render = vi.fn();
		const cache = emptyCache();

		const malformed = await handleFoobarCertificateImage(
			cardRequest("bad%20token"),
			"bad token",
			resolve,
			render,
			cache,
		);
		const missing = await handleFoobarCertificateImage(
			cardRequest("missing"),
			"missing",
			resolve,
			render,
			cache,
		);

		expect(malformed.status).toBe(404);
		expect(missing.status).toBe(404);
		expect(render).not.toHaveBeenCalled();
		expect(cache.put).not.toHaveBeenCalled();
	});

	test("renders escaped public certificate data as a cacheable PNG and caches it", async () => {
		const resolve = vi.fn().mockResolvedValue(certificate);
		const render = vi.fn(
			(html: string) => new Response(html, { headers: { "Content-Type": "image/png" } }),
		);
		const cache = emptyCache();

		const response = await handleFoobarCertificateImage(
			cardRequest("cert-a"),
			"cert-a",
			resolve,
			render,
			cache,
		);
		expect(response.headers.get("Content-Type")).toBe("image/png");
		expect(response.headers.get("Cache-Control")).toBe("public, max-age=3600");
		expect(render).toHaveBeenCalledWith(expect.stringContaining("Ada &lt;script>"));
		expect(render).toHaveBeenCalledWith(expect.stringContaining("width:1200px;height:630px"));
		expect(render).toHaveBeenCalledWith(expect.stringContaining("1 silver"));

		expect(cache.match).toHaveBeenCalledOnce();
		expect(cache.put).toHaveBeenCalledOnce();
		const [key, cached] = cache.put.mock.calls[0] ?? [];
		expect(key?.url).toBe("https://sreetamdas.com/api/foobar/certificate/cert-a/og.png");
		expect(key?.headers.get("User-Agent")).toBeNull();
		expect(cached?.headers.get("Cache-Control")).toBe("public, max-age=3600");
		expect(await response.text()).toContain("Ada &lt;script>");
	});

	test("serves a cached card without resolving or rendering", async () => {
		const resolve = vi.fn().mockResolvedValue(certificate);
		const render = vi.fn();
		const cache = {
			match: vi.fn().mockResolvedValue(
				new Response("cached png", {
					headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" },
				}),
			),
			put: vi.fn(),
		};

		const response = await handleFoobarCertificateImage(
			cardRequest("cert-a"),
			"cert-a",
			resolve,
			render,
			cache,
		);

		expect(await response.text()).toBe("cached png");
		expect(response.headers.get("Content-Type")).toBe("image/png");
		expect(resolve).not.toHaveBeenCalled();
		expect(render).not.toHaveBeenCalled();
		expect(cache.put).not.toHaveBeenCalled();
	});

	test("does not cache a failed render", async () => {
		const cache = emptyCache();

		const response = await handleFoobarCertificateImage(
			cardRequest("cert-a"),
			"cert-a",
			vi.fn().mockResolvedValue(certificate),
			() => new Response("render failed", { status: 500 }),
			cache,
		);

		expect(response.status).toBe(500);
		expect(cache.put).not.toHaveBeenCalled();
	});
});
