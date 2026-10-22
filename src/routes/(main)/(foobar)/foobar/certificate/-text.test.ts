import { describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ setResponseHeader: vi.fn(), resolve: vi.fn() }));
vi.mock("@tanstack/react-start/server", () => ({ setResponseHeader: mocks.setResponseHeader }));
vi.mock("@/lib/domains/foobar/certificate-lookup.server", async (importOriginal) => ({
	...(await importOriginal()),
	resolveFoobarCertificate: mocks.resolve,
}));

import { type FoobarCertificate } from "@/lib/domains/foobar/certificate";
import { handleFoobarCertificateText } from "@/lib/domains/foobar/certificate-text.server";

import { Route } from "./$token";

const certificate: FoobarCertificate = {
	name: "Ada <script>",
	completedAt: Date.UTC(2026, 6, 16),
	certificateId: "cert-a",
	stars: { headers: "silver", teapot: "gold" },
};
const ESC = "\x1b";

function get(path: string, headers: Record<string, string>) {
	return new Request(`https://sreetamdas.com${path}`, { headers });
}

describe("Foobar certificate for terminals", () => {
	test("gives curl coloured text that varies by agent and Accept", async () => {
		const resolve = vi.fn().mockResolvedValue(certificate);
		const response = await handleFoobarCertificateText(
			get("/foobar/certificate/cert-a", { "User-Agent": "curl/8.7.1", Accept: "*/*" }),
			"cert-a",
			resolve,
		);

		expect(response?.status).toBe(200);
		expect(response?.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
		expect(response?.headers.get("Cache-Control")).toBe("public, max-age=3600");
		expect(response?.headers.get("Vary")).toBe("User-Agent, Accept");
		const text = (await response?.text()) ?? "";
		expect(text).toContain(ESC);
		const plain = text.replaceAll(new RegExp(`${ESC}\\[[\\d;]*m`, "g"), "");
		expect(plain).toContain("Ada <script>");
		expect(plain).toContain("2* · 1 gold · 1 silver");
		expect(resolve).toHaveBeenCalledWith("cert-a");
	});

	test.each(["Wget/1.24.5", "HTTPie/3.2.4", "xh/0.22.2"])(
		"treats %s as a terminal",
		async (agent) => {
			const resolve = vi.fn().mockResolvedValue(certificate);
			const response = await handleFoobarCertificateText(
				get("/foobar/certificate/cert-a", { "User-Agent": agent }),
				"cert-a",
				resolve,
			);

			expect(response?.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
		},
	);

	test.each(["text/html", "text/html,*/*"])(
		"gives curl the HTML page when it asks for %s",
		async (accept) => {
			const resolve = vi.fn().mockResolvedValue(certificate);
			const response = await handleFoobarCertificateText(
				get("/foobar/certificate/cert-a", { "User-Agent": "curl/8.7.1", Accept: accept }),
				"cert-a",
				resolve,
			);

			expect(response).toBeNull();
			expect(resolve).not.toHaveBeenCalled();
		},
	);

	test("leaves browsers to the HTML page", async () => {
		const resolve = vi.fn().mockResolvedValue(certificate);
		const browser = get("/foobar/certificate/cert-a", {
			"User-Agent": "Mozilla/5.0 (Macintosh) Firefox/140.0",
			Accept: "text/html,application/xhtml+xml,text/plain;q=0.8,*/*;q=0.5",
		});

		expect(await handleFoobarCertificateText(browser, "cert-a", resolve)).toBeNull();
		expect(await handleFoobarCertificateText(browser, "bad token", resolve)).toBeNull();
		expect(resolve).not.toHaveBeenCalled();
	});

	test("serves text to an Accept of text/plain without text/html", async () => {
		const resolve = vi.fn().mockResolvedValue(certificate);
		const bare = await handleFoobarCertificateText(
			get("/foobar/certificate/cert-a", { Accept: "text/plain" }),
			"cert-a",
			resolve,
		);
		const charset = await handleFoobarCertificateText(
			get("/foobar/certificate/cert-a", { Accept: "text/plain; charset=utf-8" }),
			"cert-a",
			resolve,
		);

		expect(await bare?.text()).toContain(ESC);
		expect(charset?.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
		expect(await charset?.text()).not.toContain(ESC);
	});

	test.each(["?plain", "?no-color"])("drops colour for %s", async (query) => {
		const resolve = vi.fn().mockResolvedValue(certificate);
		const response = await handleFoobarCertificateText(
			get(`/foobar/certificate/cert-a${query}`, { "User-Agent": "curl/8.7.1" }),
			"cert-a",
			resolve,
		);

		const text = (await response?.text()) ?? "";
		expect(text).toContain("Ada <script>");
		expect(text).not.toContain(ESC);
	});

	test("returns a short plain 404 for an unknown or malformed token", async () => {
		const resolve = vi.fn().mockResolvedValue(null);
		const curl = { "User-Agent": "curl/8.7.1" };

		const missing = await handleFoobarCertificateText(
			get("/foobar/certificate/missing", curl),
			"missing",
			resolve,
		);
		const malformed = await handleFoobarCertificateText(
			get("/foobar/certificate/bad%20token", curl),
			"bad token",
			resolve,
		);

		for (const response of [missing, malformed]) {
			expect(response?.status).toBe(404);
			expect(response?.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
			expect(response?.headers.get("Vary")).toBe("User-Agent, Accept");
			expect(await response?.text()).toBe("404: this field record does not exist.\n");
		}
		expect(resolve).toHaveBeenCalledTimes(1);
	});
});

describe("Foobar certificate route GET", () => {
	const rendersPage = new Error("next() renders the HTML page");

	function callGet(request: Request) {
		const handlers = Route.options.server?.handlers;
		if (!handlers || typeof handlers === "function" || typeof handlers.GET !== "function") {
			throw new Error("The certificate route should define a GET handler");
		}
		const next = vi.fn((): never => {
			throw rendersPage;
		});
		const result = handlers.GET({
			context: undefined,
			request,
			params: { token: "cert-a" },
			pathname: Route.path,
			next,
		});
		return { result, next };
	}

	test("answers curl itself", async () => {
		mocks.resolve.mockResolvedValue(certificate);
		const { result, next } = callGet(
			get("/foobar/certificate/cert-a", { "User-Agent": "curl/8.7.1" }),
		);

		const response = await result;
		expect(response instanceof Response && response.headers.get("Vary")).toBe("User-Agent, Accept");
		expect(next).not.toHaveBeenCalled();
	});

	test("sets Vary and renders the page for a browser", async () => {
		mocks.setResponseHeader.mockClear();
		const { result, next } = callGet(
			get("/foobar/certificate/cert-a", { "User-Agent": "Mozilla/5.0", Accept: "text/html" }),
		);

		await expect(result).rejects.toBe(rendersPage);
		expect(next).toHaveBeenCalledOnce();
		expect(mocks.setResponseHeader).toHaveBeenCalledWith("Vary", "User-Agent, Accept");
	});
});
