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
import { handleViewRecordRequestForRuntime } from "@/lib/domains/PageInteraction/ViewRecorder.server";

type KvPut = {
	key: string;
	value: string;
	expirationTtl: number | undefined;
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

function createRuntime(kv: {
	get: (key: string) => Promise<string | null>;
	put: (key: string, value: string, options: KVNamespacePutOptions) => Promise<void>;
}) {
	return {
		KV: kv,
		LIKES_COOKIE_SECRET: "cookie-secret",
		LIKES_IP_SALT: "ip-salt",
	};
}

function createViewRequest(init: RequestInit = {}) {
	const headers = new Headers(init.headers);
	if (!headers.has("origin")) headers.set("origin", "https://example.com");
	if (!headers.has("cf-connecting-ip")) headers.set("cf-connecting-ip", "1.2.3.4");
	return new Request("https://example.com/api/views", {
		...init,
		method: "POST",
		headers,
		body: init.body ?? JSON.stringify({ slug: "/about?ignored=true" }),
	});
}

beforeEach(() => {
	pageViews.upsertPageViews.mockReset().mockResolvedValue({ view_count: 12 });
	database.getDb.mockClear();
});

describe("handleViewRecordRequestForRuntime", () => {
	test("records a same-origin page view, dedupes it in KV, and sets a visitor cookie", async () => {
		const { kv, puts } = createKv();

		const response = await handleViewRecordRequestForRuntime(
			createViewRequest(),
			createRuntime(kv),
		);

		expect(response.status).toBe(204);
		expect(response.headers.get("Cache-Control")).toBe("no-store");
		expect(response.headers.get("Set-Cookie") ?? "").toContain(`${LIKE_ID_COOKIE_NAME}=`);
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
		const firstResponse = await handleViewRecordRequestForRuntime(
			createViewRequest({
				headers: { cookie: `${LIKE_ID_COOKIE_NAME}=${cookie.value}` },
			}),
			createRuntime(kv),
		);
		const firstCookie = firstResponse.headers.get("Set-Cookie");

		const secondResponse = await handleViewRecordRequestForRuntime(
			createViewRequest({
				headers: { cookie: `${LIKE_ID_COOKIE_NAME}=${cookie.value}` },
			}),
			createRuntime(kv),
		);

		expect(firstCookie).toBeNull();
		expect(secondResponse.status).toBe(204);
		expect(pageViews.upsertPageViews).toHaveBeenCalledOnce();
	});

	test("rejects cross-origin posts before writing", async () => {
		const { kv } = createKv();

		const response = await handleViewRecordRequestForRuntime(
			createViewRequest({ headers: { origin: "https://attacker.example" } }),
			createRuntime(kv),
		);

		expect(response.status).toBe(403);
		expect(response.headers.get("Cache-Control")).toBe("no-store");
		expect(pageViews.upsertPageViews).not.toHaveBeenCalled();
	});

	test("rejects invalid or non-page slugs before writing", async () => {
		const { kv } = createKv();

		const response = await handleViewRecordRequestForRuntime(
			createViewRequest({ body: JSON.stringify({ slug: "/api/presence" }) }),
			createRuntime(kv),
		);

		expect(response.status).toBe(400);
		expect(pageViews.upsertPageViews).not.toHaveBeenCalled();
	});
});
