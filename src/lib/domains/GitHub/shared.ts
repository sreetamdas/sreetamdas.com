export const GITHUB_API_BASE_URL = "https://api.github.com";

function getGitHubToken() {
	return (
		process.env.VITE_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN ?? import.meta.env.VITE_GITHUB_TOKEN
	);
}

export function getGitHubHeaders() {
	const token = getGitHubToken();
	return {
		Accept: "application/vnd.github+json",
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		"X-GitHub-Api-Version": "2022-11-28",
		"User-Agent": "sreetamdas.com",
	};
}
