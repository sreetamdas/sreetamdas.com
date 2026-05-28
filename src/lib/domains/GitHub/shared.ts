import { readServerEnvString } from "@/lib/helpers/utils";

export const GITHUB_API_BASE_URL = "https://api.github.com";

export function getGitHubToken(env: CloudflareEnv): string | undefined {
	return readServerEnvString(env, ["GITHUB_TOKEN"]);
}

export function getGitHubHeaders(token?: string) {
	return {
		Accept: "application/vnd.github+json",
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		"X-GitHub-Api-Version": "2022-11-28",
		"User-Agent": "sreetamdas.com",
	};
}
