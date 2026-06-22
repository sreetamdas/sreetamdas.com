import { describe, expect, test } from "vitest";

import buildInfo from "@/build-info.json";

import {
	getLikeRuntimeStatus,
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
		const response = handleStagingSmokeGet(
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
				writeReady: false,
			},
			ok: true,
			purpose: "staging-deploy-verification",
		});
	});

	test("reports like write readiness without exposing secret values", async () => {
		const response = handleStagingSmokeGet(
			new Request("https://staging.sreetamdas.com/api/staging-smoke"),
			{
				LIKES_COOKIE_SECRET: "cookie-secret",
				LIKES_IP_SALT: "ip-salt",
			},
		);

		expect(await response.json()).toEqual({
			build: buildInfo,
			likes: {
				cookieSecretConfigured: true,
				ipSaltConfigured: true,
				writeReady: true,
			},
			ok: true,
			purpose: "staging-deploy-verification",
		});
	});

	test("returns a no-store 404 on production", async () => {
		const response = handleStagingSmokeGet(new Request("https://sreetamdas.com/api/staging-smoke"));

		expect(response.status).toBe(404);
		expect(response.headers.get("cache-control")).toBe("no-store");
		expect(await response.text()).toBe("Not Found");
	});
});

describe("getLikeRuntimeStatus", () => {
	test("treats blank secrets as missing", () => {
		expect(
			getLikeRuntimeStatus({
				LIKES_COOKIE_SECRET: " ",
				LIKES_IP_SALT: "\t",
			}),
		).toEqual({
			cookieSecretConfigured: false,
			ipSaltConfigured: false,
			writeReady: false,
		});
	});

	test("requires both like secrets for write readiness", () => {
		expect(getLikeRuntimeStatus({ LIKES_COOKIE_SECRET: "cookie-secret" })).toEqual({
			cookieSecretConfigured: true,
			ipSaltConfigured: false,
			writeReady: false,
		});

		expect(getLikeRuntimeStatus({ LIKES_IP_SALT: "ip-salt" })).toEqual({
			cookieSecretConfigured: false,
			ipSaltConfigured: true,
			writeReady: false,
		});
	});
});
