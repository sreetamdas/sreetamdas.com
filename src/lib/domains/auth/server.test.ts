import { describe, expect, test } from "vitest";

import {
	handleSocialLoginRequestWithAuth,
	isOAuthRedirectPayload,
	resolveCallbackURL,
	startSocialSignIn,
	validateSocialSignInRequest,
} from "./server";

describe("resolveCallbackURL", () => {
	const site_url = "https://sreetamdas.com";

	test("defaults to the site URL when return URL is absent", () => {
		expect(resolveCallbackURL(undefined, site_url)).toBe(site_url);
		expect(resolveCallbackURL("", site_url)).toBe(site_url);
	});

	test("allows same-origin relative and absolute return targets", () => {
		expect(resolveCallbackURL("/slides/demo?live=abc", site_url)).toBe(
			"https://sreetamdas.com/slides/demo?live=abc",
		);

		expect(resolveCallbackURL("https://sreetamdas.com/slides/demo?slide=2&step=1", site_url)).toBe(
			"https://sreetamdas.com/slides/demo?slide=2&step=1",
		);
	});

	test("strips actionful presenter params from same-origin return targets", () => {
		expect(
			resolveCallbackURL(
				"https://sreetamdas.com/slides/demo?live=abc&master=1&presenter=1",
				site_url,
			),
		).toBe("https://sreetamdas.com/slides/demo?live=abc");
	});

	test("falls back to the site URL for cross-origin or malformed return targets", () => {
		expect(resolveCallbackURL("https://evil.example/steal", site_url)).toBe(site_url);
		expect(resolveCallbackURL("http://[", site_url)).toBe(site_url);
	});
});

describe("startSocialSignIn", () => {
	test("posts Cloudflare sign-in requests to Better Auth's generic OAuth endpoint", async () => {
		const seen_requests: Array<Request> = [];
		const result = await startSocialSignIn(
			{ provider: "cloudflare", return_url: "https://sreetamdas.com/slides/demo?master=1" },
			{
				site_url: "https://sreetamdas.com",
				auth_handler: (request) => {
					seen_requests.push(request);
					return Response.json(
						{ url: "https://dash.cloudflare.com/oauth2/auth?state=abc" },
						{ headers: { "Set-Cookie": "better-auth-state=abc; Path=/; HttpOnly" } },
					);
				},
			},
		);

		expect(result).toEqual({
			url: "https://dash.cloudflare.com/oauth2/auth?state=abc",
			cookies: ["better-auth-state=abc; Path=/; HttpOnly"],
		});

		const sign_in_request = seen_requests.at(0);
		if (!sign_in_request) throw new Error("expected Better Auth sign-in request");
		expect(sign_in_request.method).toBe("POST");
		expect(sign_in_request.url).toBe("https://sreetamdas.com/api/auth/sign-in/oauth2");
		expect(sign_in_request.headers.get("Content-Type")).toBe("application/json");
		expect(await sign_in_request.json()).toEqual({
			providerId: "cloudflare",
			callbackURL: "https://sreetamdas.com/slides/demo",
		});
	});

	test("posts Google sign-in requests to Better Auth's social endpoint", async () => {
		const seen_requests: Array<Request> = [];
		const result = await startSocialSignIn(
			{ provider: "google", return_url: "/slides/demo?master=1" },
			{
				site_url: "https://sreetamdas.com",
				auth_handler: (request) => {
					seen_requests.push(request);
					return Response.json({ url: "https://accounts.google.com/o/oauth2/v2/auth?state=abc" });
				},
			},
		);

		expect(result).toEqual({
			url: "https://accounts.google.com/o/oauth2/v2/auth?state=abc",
			cookies: [],
		});

		const sign_in_request = seen_requests.at(0);
		if (!sign_in_request) throw new Error("expected Better Auth sign-in request");
		expect(sign_in_request.method).toBe("POST");
		expect(sign_in_request.url).toBe("https://sreetamdas.com/api/auth/sign-in/social");
		expect(sign_in_request.headers.get("Content-Type")).toBe("application/json");
		expect(await sign_in_request.json()).toEqual({
			provider: "google",
			callbackURL: "https://sreetamdas.com/slides/demo",
		});
	});

	test("rejects missing provider configuration with a provider-specific error", async () => {
		await expect(
			startSocialSignIn(
				{ provider: "google", return_url: "https://sreetamdas.com/slides/demo" },
				{
					site_url: "https://sreetamdas.com",
					auth_handler: () => Response.json({ error: "provider missing" }),
				},
			),
		).rejects.toThrow("Google OAuth is not configured");
	});
});

describe("handleSocialLoginRequestWithAuth", () => {
	test("redirects to the provider URL and preserves OAuth state cookies", async () => {
		const response = await handleSocialLoginRequestWithAuth(
			new Request("https://sreetamdas.com/api/login/cloudflare?returnTo=/slides/demo?master=1"),
			"cloudflare",
			{
				site_url: "https://sreetamdas.com",
				auth_handler: () =>
					Response.json(
						{ url: "https://dash.cloudflare.com/oauth2/auth?state=abc" },
						{ headers: { "Set-Cookie": "better-auth-state=abc; Path=/; HttpOnly" } },
					),
			},
		);

		expect(response.status).toBe(302);
		expect(response.headers.get("Location")).toBe(
			"https://dash.cloudflare.com/oauth2/auth?state=abc",
		);
		expect(response.headers.get("Set-Cookie")).toContain("better-auth-state=abc");
	});

	test("returns a safe 500 when Better Auth does not return an OAuth URL", async () => {
		const response = await handleSocialLoginRequestWithAuth(
			new Request("https://sreetamdas.com/api/login/cloudflare"),
			"cloudflare",
			{
				site_url: "https://sreetamdas.com",
				auth_handler: () => Response.json({ error: "provider missing" }),
			},
		);

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({ error: "Sign-in failed" });
	});
});

describe("validateSocialSignInRequest", () => {
	test("accepts known providers with a string return URL", () => {
		expect(validateSocialSignInRequest({ provider: "google", return_url: "/slides/demo" })).toEqual(
			{
				provider: "google",
				return_url: "/slides/demo",
			},
		);
	});

	test("rejects unknown providers or missing return URLs", () => {
		expect(() =>
			validateSocialSignInRequest({ provider: "github", return_url: "/slides/demo" }),
		).toThrow("Invalid social sign-in payload");
		expect(() => validateSocialSignInRequest({ provider: "google" })).toThrow(
			"Invalid social sign-in payload",
		);
	});
});

describe("isOAuthRedirectPayload", () => {
	test("accepts only object payloads with a string URL", () => {
		expect(isOAuthRedirectPayload({ url: "https://example.com" })).toBe(true);
		expect(isOAuthRedirectPayload({ url: 123 })).toBe(false);
		expect(isOAuthRedirectPayload(null)).toBe(false);
	});
});
