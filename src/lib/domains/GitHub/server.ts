import { type Endpoints } from "@octokit/types";
import { createServerFn } from "@tanstack/react-start";

import { DEFAULT_REPO } from "@/config";
import { GITHUB_API_BASE_URL, getGitHubHeaders, getGitHubToken } from "@/lib/domains/GitHub/shared";
import { readGitHubStats } from "@/lib/domains/GitHub/stats.server";
import { type RepoContributor } from "@/lib/domains/GitHub/types";

export { type GitHubStats } from "@/lib/domains/GitHub/stats.server";

/**
 * Server-fn wrapper so route loaders call the stats read over RPC. Route modules
 * import this (not `readGitHubStats`) so the client build strips the handler and
 * its server-only imports — `readGitHubStats` lives in `stats.server.ts`, whose
 * `cloudflare:workers` dependency must never reach the client bundle.
 */
export const fetchGitHubStats = createServerFn({ method: "GET" }).handler(() => readGitHubStats());

const CONTRIBUTORS_CACHE_NAME = "github-contributors";
const CONTRIBUTORS_CACHE_KEY = "https://internal.cache/github-contributors";
const CONTRIBUTORS_CACHE_TTL = 3600;

export const fetchRepoContributors = createServerFn({ method: "GET" }).handler(async () => {
	// Opt-in edge cache (like the footer GitHub stats) so /credits doesn't hit the
	// GitHub API on every client-side navigation now that the blanket Worker
	// response cache is gone.
	const cache = await caches.open(CONTRIBUTORS_CACHE_NAME);
	const cacheKey = new Request(CONTRIBUTORS_CACHE_KEY);
	const cached = await cache.match(cacheKey);
	if (cached) {
		const data: unknown = await cached.json();
		if (Array.isArray(data)) return data as Array<RepoContributor>;
	}

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

	const contributors = data.flatMap(
		({ type, login, avatar_url, html_url }): Array<RepoContributor> => {
			if (type === "Bot" || login === DEFAULT_REPO.owner) return [];
			return [{ login, avatar_url, html_url }];
		},
	);

	await cache.put(
		cacheKey,
		new Response(JSON.stringify(contributors), {
			headers: {
				"content-type": "application/json",
				"cache-control": `max-age=${CONTRIBUTORS_CACHE_TTL}`,
			},
		}),
	);

	return contributors;
});
