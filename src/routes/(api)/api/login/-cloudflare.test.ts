import { describe, expect, test } from "vitest";

import {
	handleCloudflareLoginRequestWithAuth,
	isOAuthRedirectPayload,
	resolveCallbackURL,
} from "./cloudflare";

describe("resolveCallbackURL", () => {
	const siteUrl = "https://sreetamdas.com";

	test("defaults to the site URL when returnTo is absent", () => {
		expect(
			resolveCallbackURL(new Request("https://sreetamdas.com/api/login/cloudflare"), siteUrl),
		).toBe(siteUrl);
	});

	test("allows same-origin relative and absolute return targets", () => {
		expect(
			resolveCallbackURL(
				new Request("https://sreetamdas.com/api/login/cloudflare?returnTo=/slides/demo?live=abc"),
				siteUrl,
			),
		).toBe("https://sreetamdas.com/slides/demo?live=abc");

		expect(
			resolveCallbackURL(
				new Request(
					"https://sreetamdas.com/api/login/cloudflare?returnTo=https%3A%2F%2Fsreetamdas.com%2Fslides%2Fdemo%3Fmaster%3D1",
				),
				siteUrl,
			),
		).toBe("https://sreetamdas.com/slides/demo?master=1");
	});

	test("falls back to the site URL for cross-origin or malformed return targets", () => {
		expect(
			resolveCallbackURL(
				new Request(
					"https://sreetamdas.com/api/login/cloudflare?returnTo=https%3A%2F%2Fevil.example%2Fsteal",
				),
				siteUrl,
			),
		).toBe(siteUrl);

		expect(
			resolveCallbackURL(
				new Request("https://sreetamdas.com/api/login/cloudflare?returnTo=http%3A%2F%2F%5B"),
				siteUrl,
			),
		).toBe(siteUrl);
	});
});

describe("handleCloudflareLoginRequest", () => {
	test("posts to Better Auth's OAuth endpoint and redirects to its URL", async () => {
		const seenRequests: Array<Request> = [];
		const response = await handleCloudflareLoginRequestWithAuth(
			new Request("https://sreetamdas.com/api/login/cloudflare?returnTo=/slides/demo?master=1"),
			"https://sreetamdas.com",
			(request) => {
				seenRequests.push(request);
				return Response.json(
					{ url: "https://dash.cloudflare.com/oauth2/auth?state=abc" },
					{ headers: { "Set-Cookie": "better-auth-state=abc; Path=/; HttpOnly" } },
				);
			},
		);

		expect(response.status).toBe(302);
		expect(response.headers.get("Location")).toBe(
			"https://dash.cloudflare.com/oauth2/auth?state=abc",
		);
		expect(response.headers.get("Set-Cookie")).toContain("better-auth-state=abc");
		expect(response.headers.has("Content-Type")).toBe(false);

		const signInRequest = seenRequests.at(0);
		if (!signInRequest) throw new Error("expected Better Auth sign-in request");
		expect(signInRequest.method).toBe("POST");
		expect(signInRequest.url).toBe("https://sreetamdas.com/api/auth/sign-in/oauth2");
		expect(signInRequest.headers.get("Content-Type")).toBe("application/json");
		expect(await signInRequest.json()).toEqual({
			providerId: "cloudflare",
			callbackURL: "https://sreetamdas.com/slides/demo?master=1",
		});
	});

	test("returns a safe 500 when Better Auth does not return an OAuth URL", async () => {
		const response = await handleCloudflareLoginRequestWithAuth(
			new Request("https://sreetamdas.com/api/login/cloudflare"),
			"https://sreetamdas.com",
			() => Response.json({ error: "provider missing" }),
		);

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({ error: "Cloudflare OAuth is not configured" });
	});
});

describe("isOAuthRedirectPayload", () => {
	test("accepts only object payloads with a string URL", () => {
		expect(isOAuthRedirectPayload({ url: "https://example.com" })).toBe(true);
		expect(isOAuthRedirectPayload({ url: 123 })).toBe(false);
		expect(isOAuthRedirectPayload(null)).toBe(false);
	});
});
