import { describe, expect, test, vi } from "vitest";

const handlerMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({
	getAuth: () => ({ handler: handlerMock }),
}));

import { handleAuthRequest } from "./$";

describe("handleAuthRequest", () => {
	test("forces Cache-Control: no-store so Workers Cache never stores auth responses", async () => {
		handlerMock.mockResolvedValue(
			new Response(JSON.stringify({ session: null }), {
				status: 200,
				headers: { "content-type": "application/json" },
			}),
		);

		const response = await handleAuthRequest(
			new Request("https://example.com/api/auth/get-session"),
		);

		expect(response.headers.get("Cache-Control")).toBe("no-store");
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ session: null });
	});

	test("preserves status, body, and Set-Cookie while forcing no-store", async () => {
		const headers = new Headers({ "content-type": "application/json" });
		headers.append("set-cookie", "session=abc; HttpOnly");
		handlerMock.mockResolvedValue(
			new Response(JSON.stringify({ ok: true }), {
				status: 201,
				statusText: "Created",
				headers,
			}),
		);

		const response = await handleAuthRequest(new Request("https://example.com/api/auth/sign-in"));

		expect(response.status).toBe(201);
		expect(response.statusText).toBe("Created");
		expect(response.headers.get("Cache-Control")).toBe("no-store");
		expect(response.headers.get("set-cookie")).toBe("session=abc; HttpOnly");
		expect(await response.json()).toEqual({ ok: true });
	});
});
