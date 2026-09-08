import { beforeEach, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getRequest: vi.fn(),
	getDb: vi.fn(),
	upsertPageViews: vi.fn(),
	env: {
		ANALYTICS_ALLOWED_ORIGINS: "https://sreetamdas.com",
		LIKES_IP_SALT: "test-salt",
		VIEW_RATE_LIMITER: { limit: vi.fn() },
		VIEW_REPLAY_LIMITER: { limit: vi.fn() },
	},
}));
vi.mock("@tanstack/react-start/server", () => ({ getRequest: mocks.getRequest }));
vi.mock("cloudflare:workers", () => ({ env: mocks.env }));
vi.mock("@/db", () => ({ getDb: mocks.getDb }));
vi.mock("@/lib/domains/PageViews", () => ({ upsertPageViews: mocks.upsertPageViews }));
vi.mock("./ViewRecorder.pages.server", () => ({ isKnownViewPage: (path: string) => path === "/" }));
import { recordPageViewInDb } from "./ViewRecorder.data.server";

beforeEach(() => {
	vi.clearAllMocks();
	mocks.env.VIEW_RATE_LIMITER.limit.mockResolvedValue({ success: true });
	mocks.env.VIEW_REPLAY_LIMITER.limit.mockResolvedValue({ success: true });
	mocks.getDb.mockReturnValue("db");
	mocks.getRequest.mockReturnValue(
		new Request("https://sreetamdas.com/_serverFn/test", {
			method: "POST",
			headers: {
				origin: "https://sreetamdas.com",
				"user-agent": "Mozilla Chrome/140",
				"cf-connecting-ip": "192.0.2.1",
			},
		}),
	);
});

test("runtime rejected request never opens D1", async () => {
	mocks.env.VIEW_REPLAY_LIMITER.limit.mockResolvedValue({ success: false });
	expect(await recordPageViewInDb({ slug: "/", disabled: false })).toEqual({ recorded: false });
	expect(mocks.getDb).not.toHaveBeenCalled();
	expect(mocks.upsertPageViews).not.toHaveBeenCalled();
});

test("unknown pathname cannot create a counter row", async () => {
	expect(await recordPageViewInDb({ slug: "/made-up", disabled: false })).toEqual({
		recorded: false,
	});
	expect(mocks.getDb).not.toHaveBeenCalled();
	expect(mocks.env.VIEW_RATE_LIMITER.limit).not.toHaveBeenCalled();
});

test("accepted runtime request writes once", async () => {
	expect(await recordPageViewInDb({ slug: "/", disabled: false })).toEqual({ recorded: true });
	expect(mocks.upsertPageViews).toHaveBeenCalledExactlyOnceWith("db", "/");
});
