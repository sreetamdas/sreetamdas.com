import { Octokit } from "@octokit/core";
import axios from "axios";

export const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
export const DEFAULT_REPO = {
	owner: "sreetamdas",
	repo: "sreetamdas.com",
};

export type StatsResult = {
	stars: number;
	forks: number;
};

type StatsQuery = {
	owner: string;
	repo: string;
};

/**
 * Fetch GitHub stats from /api/github/stats
 */
export async function getGitHubStats(body: StatsQuery) {
	const response = (
		await axios.post<StatsResult>("/api/github/stats", body, {
			headers: {
				"Content-Type": "application/json",
			},
		})
	).data;

	return response;
}
