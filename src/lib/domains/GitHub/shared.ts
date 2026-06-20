/**
 * Shared GitHub API wiring. Tokens are always read from server/runtime env so
 * public builds can use unauthenticated requests while private limits stay
 * available to Cloudflare Workers and static server functions.
 */
import { env } from "cloudflare:workers";

export const GITHUB_API_BASE_URL = "https://api.github.com";

export function getGitHubToken(): string | undefined {
	return env.GITHUB_TOKEN || undefined;
}

export function getGitHubHeaders(token?: string) {
	return {
		Accept: "application/vnd.github+json",
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		"X-GitHub-Api-Version": "2022-11-28",
		"User-Agent": "sreetamdas.com",
	};
}
