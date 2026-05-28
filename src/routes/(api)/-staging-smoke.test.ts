import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { handleStagingSmokeGet, isStagingSmokeHost } from "./api/staging-smoke";

describe("isStagingSmokeHost", () => {
	test("allows staging hosts and local development", () => {
		assert.equal(isStagingSmokeHost("staging.sreetamdas.com"), true);
		assert.equal(isStagingSmokeHost("dev.sreetamdas.com"), true);
		assert.equal(isStagingSmokeHost("localhost"), true);
		assert.equal(isStagingSmokeHost("127.0.0.1"), true);
	});

	test("blocks production and unrelated hosts", () => {
		assert.equal(isStagingSmokeHost("sreetamdas.com"), false);
		assert.equal(isStagingSmokeHost("example.com"), false);
	});
});

describe("handleStagingSmokeGet", () => {
	test("returns a no-store smoke payload on staging", async () => {
		const response = handleStagingSmokeGet(
			new Request("https://staging.sreetamdas.com/api/staging-smoke"),
		);

		assert.equal(response.status, 200);
		assert.equal(response.headers.get("cache-control"), "no-store");
		assert.match(response.headers.get("content-type") ?? "", /^application\/json/);
		assert.deepEqual(await response.json(), {
			marker: "staging-smoke-2026-05-28-foobar-docs",
			ok: true,
			purpose: "staging-deploy-verification",
		});
	});

	test("returns a no-store 404 on production", async () => {
		const response = handleStagingSmokeGet(new Request("https://sreetamdas.com/api/staging-smoke"));

		assert.equal(response.status, 404);
		assert.equal(response.headers.get("cache-control"), "no-store");
		assert.equal(await response.text(), "Not Found");
	});
});
