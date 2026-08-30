import { describe, expect, test, vi } from "vitest";

const cloudflare = vi.hoisted<{ env: Record<string, unknown> }>(() => ({ env: {} }));
vi.mock("cloudflare:workers", () => cloudflare);

import { handleTrackerGet } from "./tracker";

describe("native tracker route", () => {
	test("serves the tracker from the stats binding", async () => {
		const fetch = vi.fn(() => Promise.resolve(new Response("tracker", { status: 200 })));
		cloudflare.env = { STATS: { fetch } };
		const response = await handleTrackerGet();
		expect(response.status).toBe(200);
		expect(await response.text()).toBe("tracker");
	});
});
