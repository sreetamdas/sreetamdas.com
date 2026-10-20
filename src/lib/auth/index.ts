import "@tanstack/react-start/server-only";
import type { GithubProfile } from "better-auth/social-providers";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth, type SocialProviders } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { env } from "cloudflare:workers";

import { IS_DEV } from "@/config";
import { getDb } from "@/db";
import * as schema from "@/db/schema";

const DEFAULT_SITE_URL = "https://sreetamdas.com";

type AuthHelperEnv = Partial<
	Pick<CloudflareEnv, "BETTER_AUTH_SECRET" | "SLIDE_PRESENTER_EMAILS" | "VITE_SITE_URL">
> & {
	SITE_URL?: string;
};

export type AuthSession = Awaited<ReturnType<ReturnType<typeof getAuth>["api"]["getSession"]>>;

export function getAuth() {
	const siteUrl = getSiteUrl();
	const google_oauth_config = getGoogleOAuthConfig();
	const github_oauth_config = getGithubOAuthConfig();

	const socialProviders: SocialProviders = {};
	if (google_oauth_config) socialProviders.google = google_oauth_config;
	if (github_oauth_config) socialProviders.github = github_oauth_config;

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
		socialProviders,
		plugins: [tanstackStartCookies()],
		trustedOrigins: [siteUrl],
	});
}

export type ConfiguredSignInProvider = "google" | "github";

type SignInProviderEnv = Partial<
	Pick<
		CloudflareEnv,
		| "BETTER_AUTH_SECRET"
		| "GOOGLE_OAUTH_CLIENT_ID"
		| "GOOGLE_OAUTH_CLIENT_SECRET"
		| "GITHUB_OAUTH_CLIENT_ID"
		| "GITHUB_OAUTH_CLIENT_SECRET"
	>
>;

/** Providers whose login would succeed: Better Auth has a secret and the provider has both credentials. */
export function getConfiguredSignInProviders(
	authEnv: SignInProviderEnv = env,
	isDev = IS_DEV,
): Array<ConfiguredSignInProvider> {
	if (!authEnv.BETTER_AUTH_SECRET && !isDev) return [];

	const providers: Array<ConfiguredSignInProvider> = [];
	if (authEnv.GOOGLE_OAUTH_CLIENT_ID && authEnv.GOOGLE_OAUTH_CLIENT_SECRET) {
		providers.push("google");
	}
	if (authEnv.GITHUB_OAUTH_CLIENT_ID && authEnv.GITHUB_OAUTH_CLIENT_SECRET) {
		providers.push("github");
	}
	return providers;
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

function getGithubOAuthConfig() {
	const client_id = env.GITHUB_OAUTH_CLIENT_ID;
	const client_secret = env.GITHUB_OAUTH_CLIENT_SECRET;

	if (!client_id || !client_secret) {
		return undefined;
	}

	return {
		clientId: client_id,
		clientSecret: client_secret,
		overrideUserInfoOnSignIn: true,
		getUserInfo: async (token: { accessToken?: string }) => {
			if (!token.accessToken) return null;
			const response = await fetch("https://api.github.com/user", {
				headers: {
					Authorization: `Bearer ${token.accessToken}`,
					"User-Agent": "sreetamdas.com",
				},
			});
			const profile: GithubProfile = await response.json();
			return {
				user: {
					name: profile.login,
					email: profile.email ?? `${profile.id}@github.local`,
					image: profile.avatar_url,
					emailVerified: false,
				},
				data: profile,
			};
		},
	};
}
