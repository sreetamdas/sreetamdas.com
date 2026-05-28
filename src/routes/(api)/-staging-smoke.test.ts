import { describe, expect, test } from "vitest";

import buildInfo from "@/build-info.json";

import { handleStagingSmokeGet, isStagingSmokeHost } from "./api/staging-smoke";

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
