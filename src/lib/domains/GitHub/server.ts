import { type Endpoints } from "@octokit/types";
import { createServerFn } from "@tanstack/react-start";

import { DEFAULT_REPO } from "@/config";
import { GITHUB_API_BASE_URL, getGitHubHeaders, getGitHubToken } from "@/lib/domains/GitHub/shared";
import { type RepoContributor } from "@/lib/domains/GitHub/types";

type GitHubStats = { stars: number; forks: number };

function isGitHubStats(value: unknown): value is GitHubStats {
	return (
		typeof value === "object" &&
		value !== null &&
		"stars" in value &&
		"forks" in value &&
		typeof value.stars === "number" &&
		typeof value.forks === "number"
	);
}

const STATS_CACHE_NAME = "github-stats";
const STATS_CACHE_KEY = "https://internal.cache/github-stats";
const STATS_CACHE_TTL = 3600;

export async function readGitHubStats(): Promise<GitHubStats> {
	const cache = await caches.open(STATS_CACHE_NAME);
	const cacheKey = new Request(STATS_CACHE_KEY);
	const cached = await cache.match(cacheKey);
	if (cached) {
		const data: unknown = await cached.json();
		if (isGitHubStats(data)) return data;
	}

	const token = getGitHubToken();
	const request = await fetch(
		`${GITHUB_API_BASE_URL}/repos/${DEFAULT_REPO.owner}/${DEFAULT_REPO.repo}`,
		{
			headers: getGitHubHeaders(token),
		},
	);

	if (!request.ok) {
		return { stars: 0, forks: 0 };
	}

	const data: Endpoints["GET /repos/{owner}/{repo}"]["response"]["data"] = await request.json();

	const { stargazers_count: stars, forks_count: forks } = data;
	const stats: GitHubStats = { stars, forks };

	await cache.put(
		cacheKey,
		new Response(JSON.stringify(stats), {
			headers: {
				"content-type": "application/json",
				"cache-control": `max-age=${STATS_CACHE_TTL}`,
			},
		}),
	);

	return stats;
}

export const fetchGitHubStats = createServerFn({ method: "GET" }).handler(async () => {
	return readGitHubStats();
});

export const fetchRepoContributors = createServerFn({ method: "GET" }).handler(async () => {
	const token = getGitHubToken();
	const request = await fetch(
		`${GITHUB_API_BASE_URL}/repos/${DEFAULT_REPO.owner}/${DEFAULT_REPO.repo}/contributors`,
		{
			headers: getGitHubHeaders(token),
		},
	);

	if (!request.ok) {
		return [];
	}

	const data: Endpoints["GET /repos/{owner}/{repo}/contributors"]["response"]["data"] =
		await request.json();

	return data.flatMap(({ type, login, avatar_url, html_url }): Array<RepoContributor> => {
		if (type === "Bot" || login === DEFAULT_REPO.owner) return [];
		return [{ login, avatar_url, html_url }];
	});
});
