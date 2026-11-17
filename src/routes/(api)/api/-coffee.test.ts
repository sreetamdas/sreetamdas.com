import { describe, expect, test } from "vitest";

import { getFoobarRewardPath } from "@/lib/domains/foobar/codes";

import { handleCoffee } from "./coffee";

const coffeeUrl = "https://example.com/api/coffee";

describe("Foobar coffee clue", () => {
	test("a GET only advertises POST", async () => {
		const response = handleCoffee(new Request(coffeeUrl));

		expect(response.status).toBe(405);
		expect(response.headers.get("allow")).toBe("POST");
		expect(await response.json()).toEqual({ error: "Method not allowed", allowed: ["POST"] });
	});

	test("a POST is a teapot that points at both clues", async () => {
		const response = handleCoffee(new Request(coffeeUrl, { method: "POST" }));

		expect(response.status).toBe(418);
		expect(await response.json()).toEqual({
			message: "Cannot brew coffee, I'm a teapot",
			foobar: getFoobarRewardPath("teapot"),
			jar: "/api/foobar/cookie",
		});
	});
});
