import { beforeEach, describe, expect, test, vi } from "vitest";

import { recordPageView, type ViewGuardEnv } from "./ViewRecorder.server";

const origin = "https://sreetamdas.com";
const initialTime = Date.parse("2026-09-08T10:00:00Z");
let now = initialTime;
function request(headers: Record<string, string> = {}) {
	return new Request(`${origin}/_serverFn/record`, {
		method: "POST",
		headers: {
			origin,
			"sec-fetch-site": "same-origin",
			"user-agent": "Mozilla/5.0 Chrome/140.0",
			"cf-connecting-ip": "192.0.2.1",
			...headers,
		},
	});
}
function limiter(limit: number, duration: number) {
	const buckets = new Map<string, { start: number; count: number }>();
	return {
		limit: vi.fn(async ({ key }: { key: string }) => {
			let bucket = buckets.get(key);
			if (!bucket || now - bucket.start >= duration) {
				bucket = { start: now, count: 0 };
				buckets.set(key, bucket);
			}
			bucket.count++;
			return { success: bucket.count <= limit };
		}),
	};
}
let budget = limiter(30, 60_000);
let replay = limiter(1, 10_000);
let env: ViewGuardEnv;
const write = vi.fn(async (_slug: string) => {});
const known = (slug: string) => ["/", "/about", "/blog/real-post"].includes(slug);
const record = (slug = "/", req = request(), disabled = false) =>
	recordPageView({ slug, disabled }, req, env, known, write, now);

beforeEach(() => {
	now = initialTime;
	budget = limiter(30, 60_000);
	replay = limiter(1, 10_000);
	env = {
		ANALYTICS_ALLOWED_ORIGINS: origin,
		LIKES_IP_SALT: "test-salt",
		VIEW_RATE_LIMITER: budget,
		VIEW_REPLAY_LIMITER: replay,
	};
	write.mockClear();
});

describe("recordPageView server guard", () => {
	test("normalizes query/trailing slash and suppresses immediate replay but counts later refreshes", async () => {
		expect(await record("/about/?ignored=1")).toEqual({ recorded: true });
		expect(await record("/about")).toEqual({ recorded: false });
		now += 10_000;
		expect(await record("/about")).toEqual({ recorded: true });
		expect(write.mock.calls).toEqual([["/about"], ["/about"]]);
	});
	test("permits another known page in the replay window", async () => {
		expect((await record()).recorded).toBe(true);
		expect((await record("/blog/real-post")).recorded).toBe(true);
	});
	test.each([
		"/made-up",
		"/api/presence",
		"/assets/a",
		"//evil.test/",
		"/\\evil.test",
		"/a\n",
		"/" + "x".repeat(513),
	])("rejects invalid/unknown %s before limiter or D1", async (slug) => {
		expect(await record(slug)).toEqual({ recorded: false });
		expect(budget.limit).not.toHaveBeenCalled();
		expect(write).not.toHaveBeenCalled();
	});
	test.each([
		{ origin: "" },
		{ origin: "null" },
		{ origin: "https://evil.test" },
		{ "sec-fetch-site": "cross-site" },
		{ "sec-fetch-site": "same-site" },
		{ "sec-fetch-mode": "navigate" },
		{ "sec-fetch-dest": "iframe" },
		{ "user-agent": "" },
		{ "user-agent": "Googlebot/2.1" },
		{ "user-agent": "HeadlessChrome/100" },
		{ "cf-connecting-ip": "", "x-forwarded-for": "192.0.2.4", "x-relay-ip": "192.0.2.4" },
	])("rejects untrusted facts %j before limiter or D1", async (headers) => {
		expect(await record("/", request(headers))).toEqual({ recorded: false });
		expect(budget.limit).not.toHaveBeenCalled();
		expect(write).not.toHaveBeenCalled();
	});
	test("disabled can only skip a write", async () => {
		expect(await record("/", request(), true)).toEqual({ recorded: false });
		expect(write).not.toHaveBeenCalled();
	});
	test.each([
		"LIKES_IP_SALT",
		"VIEW_RATE_LIMITER",
		"VIEW_REPLAY_LIMITER",
		"ANALYTICS_ALLOWED_ORIGINS",
	])("fails closed without %s", async (binding) => {
		Reflect.deleteProperty(env, binding);
		expect(await record()).toEqual({ recorded: false });
		expect(write).not.toHaveBeenCalled();
	});
	test("fails closed for either limiter failure/rejection", async () => {
		budget.limit.mockRejectedValueOnce(new Error("unavailable"));
		expect((await record()).recorded).toBe(false);
		budget.limit.mockResolvedValueOnce({ success: false });
		expect((await record()).recorded).toBe(false);
		replay.limit.mockRejectedValueOnce(new Error("unavailable"));
		expect((await record()).recorded).toBe(false);
		replay.limit.mockResolvedValueOnce({ success: false });
		expect((await record()).recorded).toBe(false);
		expect(write).not.toHaveBeenCalled();
	});
	test("caps IP regardless of UA rotation and resets after the budget interval", async () => {
		for (let index = 0; index < 31; index++) {
			const result = await record("/", request({ "user-agent": `Mozilla Chrome/${index}` }));
			expect(result.recorded).toBe(index < 30);
		}
		now += 60_000;
		expect((await record()).recorded).toBe(true);
		expect(write).toHaveBeenCalledTimes(31);
	});
	test("sends only keyed rotating pseudonyms to the bindings", async () => {
		await record();
		const key = budget.limit.mock.calls[0]?.[0].key;
		const replayKey = replay.limit.mock.calls[0]?.[0].key;
		expect(key).toMatch(/^[a-f0-9]{64}$/);
		expect(replayKey).toMatch(/^[a-f0-9]{64}$/);
		expect(key).not.toBe(replayKey);
		now += 86_400_000;
		await record();
		expect(budget.limit.mock.calls[1]?.[0].key).not.toBe(key);
		env.LIKES_IP_SALT = "rotated-salt";
		await record();
		expect(budget.limit.mock.calls[2]?.[0].key).not.toBe(budget.limit.mock.calls[1]?.[0].key);
	});
	test("does not report a failed D1 write as recorded", async () => {
		write.mockRejectedValueOnce(new Error("D1 unavailable"));
		expect(await record()).toEqual({ recorded: false });
	});
});
