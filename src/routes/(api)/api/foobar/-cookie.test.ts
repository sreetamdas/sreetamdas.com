import { describe, expect, test } from "vitest";

import { handleFoobarCookie } from "./cookie";

describe("Foobar cookie clue", () => {
	test("plants a sealed cookie without revealing the final route", async () => {
		const response = handleFoobarCookie(new Request("https://example.com/api/foobar/cookie"));

		expect(response.status).toBe(200);
		expect(response.headers.get("set-cookie")).toContain("foobar-cookie=sealed");
		expect(await response.json()).toEqual({
			message: "The jar is sealed. Change its value to open-sesame, then ask again.",
		});
	});

	test("reveals the route after the cookie is edited", async () => {
		const response = handleFoobarCookie(
			new Request("https://example.com/api/foobar/cookie", {
				headers: { Cookie: "theme=dark; foobar-cookie=open-sesame; session=ignored" },
			}),
		);

		expect(response.headers.get("set-cookie")).toBeNull();
		expect(await response.json()).toEqual({
			message: "The jar opened.",
			foobar: "/foobar/cookie-jar",
		});
	});
});
