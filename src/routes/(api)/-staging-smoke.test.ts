import { describe, expect, test } from "vitest";

import buildInfo from "@/build-info.json";

import {
	getLikeRuntimeStatus,
	getStatsRpcStatus,
	handleStagingSmokeGet,
	isStagingSmokeHost,
} from "./api/staging-smoke";

describe("isStagingSmokeHost", () => {
	test("allows staging hosts and local development", () => {
		expect(isStagingSmokeHost("staging.sreetamdas.com")).toBe(true);
		expect(isStagingSmokeHost("dev.sreetamdas.com")).toBe(true);
		expect(isStagingSmokeHost("localhost")).toBe(true);
		expect(isStagingSmokeHost("127.0.0.1")).toBe(true);
	});

	test("blocks production and unrelated hosts", () => {
		expect(isStagingSmokeHost("sreetamdas.com")).toBe(false);
		expect(isStagingSmokeHost("example.com")).toBe(false);
	});
});

describe("handleStagingSmokeGet", () => {
	test("returns a no-store smoke payload on staging", async () => {
		const response = await handleStagingSmokeGet(
			new Request("https://staging.sreetamdas.com/api/staging-smoke"),
		);

		expect(response.status).toBe(200);
		expect(response.headers.get("cache-control")).toBe("no-store");
		expect(response.headers.get("content-type") ?? "").toMatch(/^application\/json/);
		expect(await response.json()).toEqual({
			build: buildInfo,
			likes: {
				cookieSecretConfigured: false,
				ipSaltConfigured: false,
				likeSchemaReady: false,
				writeReady: false,
			},
			statsRpc: { ready: false },
			ok: true,
			purpose: "staging-deploy-verification",
		});
	});

	test("reports like write readiness without exposing secret values", async () => {
		const response = await handleStagingSmokeGet(
			new Request("https://staging.sreetamdas.com/api/staging-smoke"),
			{
				D1: readyD1(),
				LIKES_COOKIE_SECRET: "cookie-secret",
				LIKES_IP_SALT: "ip-salt",
			},
		);

		expect(await response.json()).toEqual({
			build: buildInfo,
			likes: {
				cookieSecretConfigured: true,
				ipSaltConfigured: true,
				likeSchemaReady: true,
				writeReady: true,
			},
			statsRpc: { ready: false },
			ok: true,
			purpose: "staging-deploy-verification",
		});
	});

	test("returns a no-store 404 on production", async () => {
		const response = await handleStagingSmokeGet(
			new Request("https://sreetamdas.com/api/staging-smoke"),
		);

		expect(response.status).toBe(404);
		expect(response.headers.get("cache-control")).toBe("no-store");
		expect(await response.text()).toBe("Not Found");
	});
});

describe("getStatsRpcStatus", () => {
	test("reports only whether the private stats RPC returns a ready snapshot", async () => {
		await expect(getStatsRpcStatus({})).resolves.toEqual({ ready: false });
		await expect(
			getStatsRpcStatus({
				ANALYTICS_PROJECT_SLUG: "sreetamdas-com-staging",
				STATS_RPC: { getStats: () => Promise.resolve({ status: "ready", visitors: 42 }) },
			}),
		).resolves.toEqual({ ready: true });
		await expect(
			getStatsRpcStatus({
				ANALYTICS_PROJECT_SLUG: "missing",
				STATS_RPC: { getStats: () => Promise.reject(new Error("missing")) },
			}),
		).resolves.toEqual({ ready: false });
	});
});

describe("getLikeRuntimeStatus", () => {
	test("treats blank secrets as missing", async () => {
		await expect(
			getLikeRuntimeStatus({
				D1: readyD1(),
				LIKES_COOKIE_SECRET: " ",
				LIKES_IP_SALT: "\t",
			}),
		).resolves.toEqual({
			cookieSecretConfigured: false,
			ipSaltConfigured: false,
			likeSchemaReady: true,
			writeReady: false,
		});
	});

	test("requires both like secrets and D1 schema readiness for writes", async () => {
		await expect(getLikeRuntimeStatus({ LIKES_COOKIE_SECRET: "cookie-secret" })).resolves.toEqual({
			cookieSecretConfigured: true,
			likeSchemaReady: false,
			ipSaltConfigured: false,
			writeReady: false,
		});

		await expect(getLikeRuntimeStatus({ LIKES_IP_SALT: "ip-salt" })).resolves.toEqual({
			cookieSecretConfigured: false,
			likeSchemaReady: false,
			ipSaltConfigured: true,
			writeReady: false,
		});

		await expect(
			getLikeRuntimeStatus({
				LIKES_COOKIE_SECRET: "cookie-secret",
				LIKES_IP_SALT: "ip-salt",
			}),
		).resolves.toEqual({
			cookieSecretConfigured: true,
			likeSchemaReady: false,
			ipSaltConfigured: true,
			writeReady: false,
		});
	});
});

function readyD1() {
	return {
		prepare: () => ({
			run: () => Promise.resolve({}),
		}),
	};
}
