import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("cloudflare:workers", () => ({ env: {} }));

import { fetchGist } from "./fetchGist";

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe("fetchGist", () => {
	test("retries without the token when GitHub rejects it", async () => {
		vi.spyOn(console, "error").mockImplementation(() => undefined);
		const fetchMock = vi.fn((_url: string, init: { headers: Record<string, string> }) =>
			Promise.resolve(
				"Authorization" in init.headers
					? new Response("Bad credentials", { status: 401 })
					: Response.json({ files: { "p1.ts": { filename: "p1.ts" } } }),
			),
		);
		vi.stubGlobal("fetch", fetchMock);

		const gist = await fetchGist("gist_123", "expired_token");

		expect(gist.files).toHaveProperty("p1.ts");
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(fetchMock.mock.calls[1]?.[1].headers).not.toHaveProperty("Authorization");
	});

	test("still fails on a 401 when no token was sent", async () => {
		const fetchMock = vi.fn(() => Promise.resolve(new Response("Nope", { status: 401 })));
		vi.stubGlobal("fetch", fetchMock);

		await expect(fetchGist("gist_123")).rejects.toThrow("Failed to fetch gist: 401");
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});
