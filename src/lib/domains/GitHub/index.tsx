import { type Endpoints } from "@octokit/types";
import { createServerFn } from "@tanstack/react-start";
import { DEFAULT_REPO } from "@/config";

export const GITHUB_API_BASE_URL = "https://api.github.com";

function getGitHubToken() {
	return (
		process.env.VITE_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN ?? import.meta.env.VITE_GITHUB_TOKEN
	);
}

function getGitHubHeaders() {
	const token = getGitHubToken();
	return {
		Accept: "application/vnd.github+json",
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		"X-GitHub-Api-Version": "2022-11-28",
		"User-Agent": "sreetamdas.com",
	};
}

export const fetchGitHubStats = createServerFn({ method: "GET" }).handler(async () => {
	const request = await fetch(
		`${GITHUB_API_BASE_URL}/repos/${DEFAULT_REPO.owner}/${DEFAULT_REPO.repo}`,
		{
			headers: getGitHubHeaders(),
		},
	);

	if (!request.ok) {
		return { stars: 0, forks: 0 };
	}

	const data: Endpoints["GET /repos/{owner}/{repo}"]["response"]["data"] = await request.json();

	const { stargazers_count: stars, forks_count: forks } = data;

	return { stars, forks };
});

export type RepoContributor = {
	login: string | undefined;
	avatar_url: string | undefined;
	html_url: string | undefined;
};

export const fetchRepoContributors = createServerFn({ method: "GET" }).handler(async () => {
	const request = await fetch(
		`${GITHUB_API_BASE_URL}/repos/${DEFAULT_REPO.owner}/${DEFAULT_REPO.repo}/contributors`,
		{
			headers: getGitHubHeaders(),
		},
	);

	if (!request.ok) {
		return [];
	}

	const data: Endpoints["GET /repos/{owner}/{repo}/contributors"]["response"]["data"] =
		await request.json();

	return data
		.filter(({ type, login }) => type !== "Bot" && login !== DEFAULT_REPO.owner)
		.map(({ login, avatar_url, html_url }): RepoContributor => ({ login, avatar_url, html_url }));
});

export async function fetchGist(gist_id: string) {
	const request = await fetch(`${GITHUB_API_BASE_URL}/gists/${gist_id}`, {
		headers: getGitHubHeaders(),
	});

	if (!request.ok) {
		throw new Error(`Failed to fetch gist: ${request.status}`);
	}

	const data: Endpoints["GET /gists/{gist_id}"]["response"]["data"] = await request.json();

	return data;
}
