import { type Endpoints } from "@octokit/types";
import { createServerFn } from "@tanstack/react-start";
import { DEFAULT_REPO } from "@/config";
import { GITHUB_API_BASE_URL, getGitHubHeaders } from "@/lib/domains/GitHub/shared";
import { type RepoContributor } from "@/lib/domains/GitHub/types";

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
