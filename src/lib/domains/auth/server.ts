/**
 * Social sign-in server functions. The slide presenter UI calls one explicit
 * server-function endpoint for every supported provider, while the helpers here
 * keep Better Auth's provider-specific sign-in endpoints and OAuth state cookies
 * in one auth-domain boundary.
 */
import { createServerFn } from "@tanstack/react-start";
import { setResponseHeaders } from "@tanstack/react-start/server";

import { getAuth, getSiteUrl } from "@/lib/auth";

export type SocialSignInProvider = "cloudflare" | "google";

export const SOCIAL_SIGN_IN_PROVIDERS: ReadonlyArray<SocialSignInProvider> = [
	"cloudflare",
	"google",
];

type AuthHandler = (request: Request) => Promise<Response> | Response;

type SocialSignInRequest = {
	provider: SocialSignInProvider;
	return_url: string;
};

type SocialSignInDeps = {
	auth_handler: AuthHandler;
	site_url: string;
};

type SocialSignInResult = {
	url: string;
	cookies: Array<string>;
};

type SocialSignInProviderConfig = {
	error_message: string;
	path: string;
	create_body: (callback_url: string) => Record<string, unknown>;
};

const SOCIAL_SIGN_IN_PROVIDER_CONFIGS = {
	cloudflare: {
		error_message: "Cloudflare OAuth is not configured",
		path: "/api/auth/sign-in/oauth2",
		create_body: (callback_url: string) => ({
			providerId: "cloudflare",
			callbackURL: callback_url,
		}),
	},
	google: {
		error_message: "Google OAuth is not configured",
		path: "/api/auth/sign-in/social",
		create_body: (callback_url: string) => ({
			provider: "google",
			callbackURL: callback_url,
		}),
	},
} satisfies Record<SocialSignInProvider, SocialSignInProviderConfig>;

export const startSocialSignInServerFn = createServerFn({ method: "POST" })
	.validator(validateSocialSignInRequest)
	.handler(async ({ data }) => {
		const sign_in_result = await startSocialSignIn(data, {
			auth_handler: getAuth().handler,
			site_url: getSiteUrl(),
		});

		if (sign_in_result.cookies.length > 0) {
			setResponseHeaders(createCookieHeaders(sign_in_result.cookies));
		}

		return { url: sign_in_result.url };
	});

export async function handleSocialLoginRequest(
	request: Request,
	provider: SocialSignInProvider,
): Promise<Response> {
	return handleSocialLoginRequestWithAuth(request, provider, {
		auth_handler: getAuth().handler,
		site_url: getSiteUrl(),
	});
}

export async function handleSocialLoginRequestWithAuth(
	request: Request,
	provider: SocialSignInProvider,
	deps: SocialSignInDeps,
): Promise<Response> {
	try {
		return socialSignInResultToRedirect(
			await startSocialSignIn(
				{ provider, return_url: new URL(request.url).searchParams.get("returnTo") ?? "" },
				deps,
			),
		);
	} catch (error) {
		if (error instanceof SocialSignInError) {
			// oxlint-disable-next-line no-console
			console.error(error.message);
			return Response.json({ error: "Sign-in failed" }, { status: 500 });
		}

		throw error;
	}
}

export async function startSocialSignIn(
	request: SocialSignInRequest,
	deps: SocialSignInDeps,
): Promise<SocialSignInResult> {
	const config = SOCIAL_SIGN_IN_PROVIDER_CONFIGS[request.provider];
	const callback_url = resolveCallbackURL(request.return_url, deps.site_url);
	const sign_in_url = new URL(config.path, deps.site_url);
	const auth_response = await deps.auth_handler(
		new Request(sign_in_url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(config.create_body(callback_url)),
		}),
	);

	const payload: unknown = await auth_response.json();
	if (!isOAuthRedirectPayload(payload)) {
		throw new SocialSignInError(config.error_message);
	}

	return {
		url: payload.url,
		cookies: getSetCookieHeaders(auth_response.headers),
	};
}

export function resolveCallbackURL(return_url: string | undefined, site_url: string): string {
	if (!return_url) return site_url;

	try {
		const callback_url = new URL(return_url, site_url);
		const allowed_origin = new URL(site_url).origin;
		return callback_url.origin === allowed_origin ? callback_url.toString() : site_url;
	} catch {
		return site_url;
	}
}

export function isOAuthRedirectPayload(value: unknown): value is { url: string } {
	return (
		typeof value === "object" && value !== null && "url" in value && typeof value.url === "string"
	);
}

export function validateSocialSignInRequest(data: unknown): SocialSignInRequest {
	if (typeof data !== "object" || data === null) {
		throw new Error("Invalid social sign-in payload");
	}

	if (!("provider" in data) || !("return_url" in data)) {
		throw new Error("Invalid social sign-in payload");
	}

	if (!isSocialSignInProvider(data.provider) || typeof data.return_url !== "string") {
		throw new Error("Invalid social sign-in payload");
	}

	return { provider: data.provider, return_url: data.return_url };
}

class SocialSignInError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "SocialSignInError";
	}
}

function socialSignInResultToRedirect(result: SocialSignInResult): Response {
	const headers = createCookieHeaders(result.cookies);
	headers.set("Location", result.url);
	return new Response(null, { status: 302, headers });
}

function createCookieHeaders(cookies: Array<string>) {
	const headers = new Headers();
	for (const cookie of cookies) {
		headers.append("Set-Cookie", cookie);
	}
	return headers;
}

function getSetCookieHeaders(headers: Headers): Array<string> {
	const get_set_cookie = Reflect.get(headers, "getSetCookie");
	if (typeof get_set_cookie === "function") {
		const cookies: unknown = Reflect.apply(get_set_cookie, headers, []);
		if (Array.isArray(cookies) && cookies.every((cookie) => typeof cookie === "string")) {
			return cookies;
		}
	}

	const cookie = headers.get("Set-Cookie");
	return cookie ? [cookie] : [];
}

function isSocialSignInProvider(value: unknown): value is SocialSignInProvider {
	return SOCIAL_SIGN_IN_PROVIDERS.some((provider) => provider === value);
}
