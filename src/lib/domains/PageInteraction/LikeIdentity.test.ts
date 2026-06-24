import { describe, expect, test } from "vitest";

import {
	createSignedLikeCookie,
	getCookieValue,
	hashLikeIp,
	hashLikeVisitor,
	LIKE_ID_COOKIE_NAME,
	readSignedLikeCookie,
} from "./LikeIdentity";

const TOKEN = "00000000-0000-4000-8000-000000000001";
const OTHER_TOKEN = "00000000-0000-4000-8000-000000000002";
const SHA256_HEX = /^[0-9a-f]{64}$/;

describe("LikeIdentity", () => {
	test("round-trips a signed HttpOnly cookie value format", async () => {
		const signed = await createSignedLikeCookie("cookie-secret", TOKEN);

		expect(signed.token).toBe(TOKEN);
		expect(signed.value).toMatch(new RegExp(`^${TOKEN}\\.[A-Za-z0-9_-]+$`));
		expect(await readSignedLikeCookie("cookie-secret", signed.value)).toBe(TOKEN);
	});

	test("rejects a tampered cookie signature", async () => {
		const signed = await createSignedLikeCookie("cookie-secret", TOKEN);
		const tampered = signed.value.replace(/.$/, "x");

		expect(await readSignedLikeCookie("cookie-secret", tampered)).toBeUndefined();
	});

	test("rejects malformed cookie tokens", async () => {
		const signed = await createSignedLikeCookie("cookie-secret", TOKEN);
		const signature = signed.value.slice(signed.value.indexOf(".") + 1);

		expect(await readSignedLikeCookie("cookie-secret", `not-a-uuid.${signature}`)).toBeUndefined();
		expect(
			await readSignedLikeCookie("cookie-secret", `${TOKEN}.${signature}.extra`),
		).toBeUndefined();
	});

	test("derives stable visitor hashes from the token rather than the ip", async () => {
		await expect(hashLikeVisitor("cookie-secret", TOKEN)).resolves.toMatch(SHA256_HEX);
		expect(await hashLikeVisitor("cookie-secret", TOKEN)).toBe(
			await hashLikeVisitor("cookie-secret", TOKEN),
		);
		expect(await hashLikeVisitor("cookie-secret", TOKEN)).not.toBe(
			await hashLikeVisitor("cookie-secret", OTHER_TOKEN),
		);
	});

	test("derives the abuse hash from salt, salt version, slug, and ip", async () => {
		await expect(hashLikeIp("ip-salt", 1, "/about", "1.2.3.4")).resolves.toMatch(SHA256_HEX);
		expect(await hashLikeIp("ip-salt", 1, "/about", "1.2.3.4")).toBe(
			await hashLikeIp("ip-salt", 1, "/about", "1.2.3.4"),
		);
		expect(await hashLikeIp("ip-salt", 1, "/about", "1.2.3.4")).not.toBe(
			await hashLikeIp("ip-salt", 1, "/about", "5.6.7.8"),
		);
	});

	test("extracts the like cookie from a Cookie header", () => {
		expect(
			getCookieValue(
				`theme=dark; ${LIKE_ID_COOKIE_NAME}=abc.def; session=ignored`,
				LIKE_ID_COOKIE_NAME,
			),
		).toBe("abc.def");
		expect(getCookieValue("theme=dark", LIKE_ID_COOKIE_NAME)).toBeUndefined();
	});
});
