import { createFileRoute } from "@tanstack/react-router";

import { getAuth, getSiteUrl } from "@/lib/auth";

type AuthHandler = (request: Request) => Promise<Response> | Response;

export function handleCloudflareLoginRequest(
	request: Request,
	env: CloudflareEnv,
): Promise<Response> {
	return handleCloudflareLoginRequestWithAuth(request, getSiteUrl(env), getAuth(env).handler);
}

export async function handleCloudflareLoginRequestWithAuth(
	request: Request,
	siteUrl: string,
	authHandler: AuthHandler,
): Promise<Response> {
	const callbackURL = resolveCallbackURL(request, siteUrl);
	const signInUrl = new URL("/api/auth/sign-in/oauth2", request.url);
	const authResponse = await authHandler(
		new Request(signInUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				providerId: "cloudflare",
				callbackURL,
			}),
		}),
	);

	const payload: unknown = await authResponse.json();
	if (!isOAuthRedirectPayload(payload)) {
		return Response.json({ error: "Cloudflare OAuth is not configured" }, { status: 500 });
	}

	const headers = new Headers(authResponse.headers);
	headers.set("Location", payload.url);
	headers.delete("Content-Type");
	return new Response(null, { status: 302, headers });
}

export function resolveCallbackURL(request: Request, siteUrl: string): string {
	const requestUrl = new URL(request.url);
	const rawReturnTo = requestUrl.searchParams.get("returnTo");
	if (!rawReturnTo) return siteUrl;

	try {
		const returnTo = new URL(rawReturnTo, siteUrl);
		const allowedOrigin = new URL(siteUrl).origin;
		return returnTo.origin === allowedOrigin ? returnTo.toString() : siteUrl;
	} catch {
		return siteUrl;
	}
}

export function isOAuthRedirectPayload(value: unknown): value is { url: string } {
	return (
		typeof value === "object" && value !== null && "url" in value && typeof value.url === "string"
	);
}

export const Route = createFileRoute("/(api)/api/login/cloudflare")({
	server: {
		handlers: {
			GET: ({ request, context }) => handleCloudflareLoginRequest(request, context.env),
		},
	},
});
