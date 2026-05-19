export const GITHUB_API_BASE_URL = "https://api.github.com";

export function getGitHubToken(env: CloudflareEnv): string | undefined {
	const keys = ["VITE_GITHUB_TOKEN", "GITHUB_TOKEN"];
	const values = env as unknown as Record<string, unknown>;

	for (const key of keys) {
		const value = values[key];
		if (typeof value === "string" && value.length > 0) {
			return value;
		}
	}

	return undefined;
}

export function getGitHubHeaders(token?: string) {
	return {
		Accept: "application/vnd.github+json",
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		"X-GitHub-Api-Version": "2022-11-28",
		"User-Agent": "sreetamdas.com",
	};
}
