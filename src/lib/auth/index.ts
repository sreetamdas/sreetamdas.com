import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";

import { IS_DEV } from "@/config";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { readServerEnvString } from "@/lib/helpers/utils";

const DEFAULT_SITE_URL = "https://sreetamdas.com";
const DEFAULT_CLOUDFLARE_AUTHORIZATION_URL = "https://dash.cloudflare.com/oauth2/auth";
const DEFAULT_CLOUDFLARE_TOKEN_URL = "https://dash.cloudflare.com/oauth2/token";
const DEFAULT_CLOUDFLARE_USER_INFO_URL = "https://api.cloudflare.com/client/v4/user";
const DEFAULT_CLOUDFLARE_SCOPES = ["user.read"];

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

export function getAuth(env: CloudflareEnv) {
	const siteUrl = getSiteUrl(env);
	const cloudflare_oauth_config = getCloudflareOAuthConfig(env);
	const google_oauth_config = getGoogleOAuthConfig(env);

	return betterAuth({
		baseURL: `${siteUrl}/api/auth`,
		secret: getAuthSecret(env),
		database: drizzleAdapter(getDb(env), {
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
				]
			: [],
		trustedOrigins: [siteUrl],
	});
}

export async function getAuthSession(request: Request, env: CloudflareEnv): Promise<AuthSession> {
	return getAuth(env).api.getSession({ headers: request.headers });
}

export async function getAllowedPresenterEmail(
	request: Request,
	env: CloudflareEnv,
): Promise<string | undefined> {
	const session = await getAuthSession(request, env);
	const email = session?.user.email;
	return email && isAllowedPresenterEmail(email, env) ? email : undefined;
}

export function isAllowedPresenterEmail(email: string, env: object | undefined): boolean {
	const allowedEmails = parseAllowedPresenterEmails(
		readServerEnvString(env, ["SLIDE_PRESENTER_EMAILS"]),
	);
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

export function getSiteUrl(env: object | undefined): string {
	return readServerEnvString(env, ["SITE_URL", "VITE_SITE_URL"]) ?? DEFAULT_SITE_URL;
}

export function getAuthSecret(env: object | undefined, isDev = IS_DEV): string {
	const secret = readServerEnvString(env, ["BETTER_AUTH_SECRET"]);
	if (secret) return secret;
	if (isDev) return "dev-only-better-auth-secret-change-me";
	throw new Error("BETTER_AUTH_SECRET must be set in production");
}

function getCloudflareOAuthConfig(env: object | undefined) {
	const clientId = readServerEnvString(env, ["CLOUDFLARE_OAUTH_CLIENT_ID"]);
	const clientSecret = readServerEnvString(env, ["CLOUDFLARE_OAUTH_CLIENT_SECRET"]);

	if (!clientId || !clientSecret) {
		return undefined;
	}

	return {
		providerId: "cloudflare",
		clientId,
		clientSecret,
		authorizationUrl:
			readServerEnvString(env, ["CLOUDFLARE_OAUTH_AUTHORIZATION_URL"]) ??
			DEFAULT_CLOUDFLARE_AUTHORIZATION_URL,
		tokenUrl:
			readServerEnvString(env, ["CLOUDFLARE_OAUTH_TOKEN_URL"]) ?? DEFAULT_CLOUDFLARE_TOKEN_URL,
		scopes: parseOAuthScopes(readServerEnvString(env, ["CLOUDFLARE_OAUTH_SCOPES"])),
		authentication: "post" as const,
		getUserInfo: async (tokens: { accessToken?: string }) => {
			if (!tokens.accessToken) return null;

			const response = await fetch(
				readServerEnvString(env, ["CLOUDFLARE_OAUTH_USER_INFO_URL"]) ??
					DEFAULT_CLOUDFLARE_USER_INFO_URL,
				{
					headers: {
						Authorization: `Bearer ${tokens.accessToken}`,
					},
				},
			);

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

function getGoogleOAuthConfig(env: object | undefined) {
	const client_id = readServerEnvString(env, ["GOOGLE_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_ID"]);
	const client_secret = readServerEnvString(env, [
		"GOOGLE_CLIENT_SECRET",
		"GOOGLE_OAUTH_CLIENT_SECRET",
	]);

	if (!client_id || !client_secret) {
		return undefined;
	}

	return {
		clientId: client_id,
		clientSecret: client_secret,
	};
}

function parseOAuthScopes(value: string | undefined): Array<string> {
	const scopes = (value ?? "")
		.split(/[\s,]+/)
		.map((scope) => scope.trim())
		.filter((scope) => scope.length > 0);
	return scopes.length > 0 ? scopes : DEFAULT_CLOUDFLARE_SCOPES;
}

function isCloudflareUserResponse(value: unknown): value is CloudflareUserResponse {
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
