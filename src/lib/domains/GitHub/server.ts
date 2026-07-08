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
