import { Octokit } from "@octokit/core";
import { captureException } from "@sentry/nextjs";

import { DEFAULT_REPO } from "@/config";

export const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

/**
 * Fetch GitHub stats
 */
export async function getGitHubStats() {
	try {
		const {
			data: { stargazers_count: stars, forks },
		} = await octokit.request("GET /repos/{owner}/{repo}", DEFAULT_REPO);

		return { stars, forks };
	} catch (error) {
		captureException(error);

		return { stars: 0, forks: 0 };
	}
}
