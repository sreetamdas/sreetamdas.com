import { Octokit } from "@octokit/core";

import { DEFAULT_REPO } from "@/config";

export const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

/**
 * Fetch GitHub stats
 */
export async function getGitHubStats() {
	const {
		data: { stargazers_count: stars = 0, forks = 0 },
	} = await octokit.request("GET /repos/{owner}/{repo}", DEFAULT_REPO);

	return { stars, forks };
}
