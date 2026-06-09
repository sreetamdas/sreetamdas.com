import "@tanstack/react-start/server-only";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { env } from "cloudflare:workers";

import { IS_DEV } from "@/config";
import { getDb } from "@/db";
import * as schema from "@/db/schema";

const DEFAULT_SITE_URL = "https://sreetamdas.com";
const DEFAULT_CLOUDFLARE_AUTHORIZATION_URL = "https://dash.cloudflare.com/oauth2/auth";
const DEFAULT_CLOUDFLARE_TOKEN_URL = "https://dash.cloudflare.com/oauth2/token";
const DEFAULT_CLOUDFLARE_USER_INFO_URL = "https://api.cloudflare.com/client/v4/user";
const DEFAULT_CLOUDFLARE_SCOPES = ["user.read"];

type AuthHelperEnv = Partial<
	Pick<CloudflareEnv, "BETTER_AUTH_SECRET" | "SLIDE_PRESENTER_EMAILS" | "VITE_SITE_URL">
> & {
	SITE_URL?: string;
};

export type AuthSession = Awaited<ReturnType<ReturnType<typeof getAuth>["api"]["getSession"]>>;

type CloudflareUserResponse = {
	success: boolean;
	result?: {
		id?: string;
		email?: string;
		first_name?: string;
		last_name?: string;
		username?: string;
		avatar_url?: string;
	};
};

export function getAuth() {
	const siteUrl = getSiteUrl();
	const cloudflare_oauth_config = getCloudflareOAuthConfig();
	const google_oauth_config = getGoogleOAuthConfig();

	return betterAuth({
		baseURL: `${siteUrl}/api/auth`,
		secret: getAuthSecret(),
		database: drizzleAdapter(getDb(), {
			provider: "sqlite",
			schema: {
				...schema,
				user: schema.authUser,
				session: schema.authSession,
				account: schema.authAccount,
				verification: schema.authVerification,
			},
		}),
		socialProviders: google_oauth_config ? { google: google_oauth_config } : {},
		plugins: cloudflare_oauth_config
			? [
					genericOAuth({
						config: [cloudflare_oauth_config],
					}),
					tanstackStartCookies(),
				]
			: [tanstackStartCookies()],
		trustedOrigins: [siteUrl],
	});
}

export async function getAuthSession(request: Request): Promise<AuthSession> {
	return getAuth().api.getSession({ headers: request.headers });
}

export async function getAllowedPresenterEmail(request: Request): Promise<string | undefined> {
	const session = await getAuthSession(request);
	const email = session?.user?.email;
	return email && isAllowedPresenterEmail(email) ? email : undefined;
}

export function isAllowedPresenterEmail(email: string, authEnv: AuthHelperEnv = env): boolean {
	const allowedEmails = parseAllowedPresenterEmails(authEnv.SLIDE_PRESENTER_EMAILS);
	return allowedEmails.has(email.trim().toLowerCase());
}

export function parseAllowedPresenterEmails(value: string | undefined): Set<string> {
	return new Set(
		(value ?? "")
			.split(",")
			.map((email) => email.trim().toLowerCase())
			.filter((email) => email.length > 0),
	);
}

export function getSiteUrl(authEnv: AuthHelperEnv = env): string {
	return authEnv.SITE_URL || authEnv.VITE_SITE_URL || DEFAULT_SITE_URL;
}

export function getAuthSecret(authEnv: AuthHelperEnv = env, isDev = IS_DEV): string {
	const secret = authEnv.BETTER_AUTH_SECRET;
	if (secret) return secret;
	if (isDev) return "dev-only-better-auth-secret-change-me";
	throw new Error("BETTER_AUTH_SECRET must be set in production");
}

function getCloudflareOAuthConfig() {
	const clientId = env.CLOUDFLARE_OAUTH_CLIENT_ID;
	const clientSecret = env.CLOUDFLARE_OAUTH_CLIENT_SECRET;

	if (!clientId || !clientSecret) {
		return undefined;
	}

	return {
		providerId: "cloudflare",
		clientId,
		clientSecret,
		authorizationUrl: DEFAULT_CLOUDFLARE_AUTHORIZATION_URL,
		tokenUrl: DEFAULT_CLOUDFLARE_TOKEN_URL,
		scopes: DEFAULT_CLOUDFLARE_SCOPES,
		authentication: "post" as const,
		getUserInfo: async (tokens: { accessToken?: string }) => {
			if (!tokens.accessToken) return null;

			const response = await fetch(DEFAULT_CLOUDFLARE_USER_INFO_URL, {
				headers: {
					Authorization: `Bearer ${tokens.accessToken}`,
				},
			});

			if (!response.ok) return null;

			const payload: unknown = await response.json();
			if (!isCloudflareUserResponse(payload) || !payload.result?.id || !payload.result.email) {
				return null;
			}

			const firstName = payload.result.first_name?.trim() ?? "";
			const lastName = payload.result.last_name?.trim() ?? "";
			const displayName = `${firstName} ${lastName}`.trim() || payload.result.email;

			return {
				id: payload.result.id,
				email: payload.result.email,
				emailVerified: true,
				name: displayName,
				image: payload.result.avatar_url,
			};
		},
	};
}

function getGoogleOAuthConfig() {
	const client_id = env.GOOGLE_OAUTH_CLIENT_ID;
	const client_secret = env.GOOGLE_OAUTH_CLIENT_SECRET;

	if (!client_id || !client_secret) {
		return undefined;
	}

	return {
		clientId: client_id,
		clientSecret: client_secret,
	};
}

export function isCloudflareUserResponse(value: unknown): value is CloudflareUserResponse {
	if (typeof value !== "object" || value === null) return false;
	if (!("success" in value) || typeof value.success !== "boolean") return false;
	// Cloudflare error responses can omit `result`; callers still require result.id/email.
	if (!("result" in value) || value.result === undefined) return true;
	if (typeof value.result !== "object" || value.result === null) return false;
	const result = value.result;
	return (
		(!("id" in result) || typeof result.id === "string") &&
		(!("email" in result) || typeof result.email === "string") &&
		(!("first_name" in result) || typeof result.first_name === "string") &&
		(!("last_name" in result) || typeof result.last_name === "string") &&
		(!("username" in result) || typeof result.username === "string") &&
		(!("avatar_url" in result) || typeof result.avatar_url === "string")
	);
}
