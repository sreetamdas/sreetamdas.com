import { beforeEach, describe, expect, test, vi } from "vitest";

const pageViews = vi.hoisted(() => ({ upsertPageViews: vi.fn() }));
const database = vi.hoisted(() => ({ getDb: vi.fn(() => ({ name: "db" })) }));
const config = vi.hoisted(() => ({ LIKES_SALT_VERSION: 1 }));
const cloudflare = vi.hoisted(() => ({ env: {} }));

vi.mock("@/lib/domains/PageViews", () => pageViews);
vi.mock("@/db", () => database);
vi.mock("@/config", () => config);
vi.mock("cloudflare:workers", () => cloudflare);

import {
	createSignedLikeCookie,
	LIKE_ID_COOKIE_NAME,
} from "@/lib/domains/PageInteraction/LikeIdentity";

import { recordPageView } from "./ViewRecorder.server";

type KvPut = {
	key: string;
	value: string;
	expirationTtl: number | undefined;
};

type TestDedupeStore = {
	get: (key: string) => Promise<string | null>;
	put: (key: string, value: string, options: KVNamespacePutOptions) => Promise<void>;
};

function createKv(existingKeys: Array<string> = []) {
	const values = new Map(existingKeys.map((key) => [key, "1"]));
	const puts: Array<KvPut> = [];
	return {
		puts,
		kv: {
			get: vi.fn((key: string) => Promise.resolve(values.get(key) ?? null)),
			put: vi.fn((key: string, value: string, options?: KVNamespacePutOptions) => {
				puts.push({ key, value, expirationTtl: options?.expirationTtl });
				values.set(key, value);
				return Promise.resolve();
			}),
		},
	};
}

function createRuntime(kv: TestDedupeStore) {
	return {
		KV: kv,
		LIKES_COOKIE_SECRET: "cookie-secret",
		LIKES_IP_SALT: "ip-salt",
	};
}

beforeEach(() => {
	pageViews.upsertPageViews.mockReset().mockResolvedValue({ view_count: 12 });
	database.getDb.mockClear();
});

describe("recordPageView", () => {
	test("records a page view, dedupes it in KV, and sets a visitor cookie", async () => {
		const { kv, puts } = createKv();
		const setViewCookie = vi.fn();

		const result = await recordPageView(
			{ slug: "/about?ignored=true", disabled: false },
			{ clientIp: "1.2.3.4", setViewCookie },
			createRuntime(kv),
		);

		expect(result).toEqual({ recorded: true });
		expect(setViewCookie).toHaveBeenCalledOnce();
		expect(pageViews.upsertPageViews).toHaveBeenCalledWith(expect.anything(), "/about");
		expect(puts).toHaveLength(2);
		expect(puts.every((put) => put.expirationTtl === 3600)).toBe(true);
	});

	test("does not increment when the visitor or ip has a recent KV dedupe marker", async () => {
		const cookie = await createSignedLikeCookie(
			"cookie-secret",
			"00000000-0000-4000-8000-000000000001",
		);
		const { kv } = createKv();
		const context = {
			clientIp: "1.2.3.4",
			cookieHeader: `${LIKE_ID_COOKIE_NAME}=${cookie.value}`,
		};

		const firstResult = await recordPageView(
			{ slug: "/about", disabled: false },
			context,
			createRuntime(kv),
		);
		const secondResult = await recordPageView(
			{ slug: "/about", disabled: false },
			context,
			createRuntime(kv),
		);

		expect(firstResult).toEqual({ recorded: true });
		expect(secondResult).toEqual({ recorded: false });
		expect(pageViews.upsertPageViews).toHaveBeenCalledOnce();
	});

	test("does not write when the counter is disabled", async () => {
		const { kv } = createKv();

		const result = await recordPageView(
			{ slug: "/about", disabled: true },
			{ clientIp: "1.2.3.4" },
			createRuntime(kv),
		);

		expect(result).toEqual({ recorded: false });
		expect(pageViews.upsertPageViews).not.toHaveBeenCalled();
	});

	test("rejects invalid or non-page slugs before writing", async () => {
		const { kv } = createKv();

		const result = await recordPageView(
			{ slug: "/api/presence", disabled: false },
			{ clientIp: "1.2.3.4" },
			createRuntime(kv),
		);

		expect(result).toEqual({ recorded: false });
		expect(pageViews.upsertPageViews).not.toHaveBeenCalled();
	});
});
