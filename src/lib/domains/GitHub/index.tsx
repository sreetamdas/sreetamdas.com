import { Octokit } from "@octokit/core";
import { captureException } from "@sentry/nextjs";
import Image from "next/image";
import { cache } from "react";

import { DEFAULT_REPO } from "@/config";
import { LinkTo } from "@/lib/components/Anchor";

export const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const fetchGitHubStats = cache(async (owner: string, repo: string) => {
	const {
		data: { stargazers_count: stars, forks },
	} = await octokit.request("GET /repos/{owner}/{repo}", { owner, repo });

	return { stars, forks };
});

export async function getGitHubStats() {
	try {
		return await fetchGitHubStats(DEFAULT_REPO.owner, DEFAULT_REPO.repo);
	} catch (error) {
		captureException(error);

		return { stars: 0, forks: 0 };
	}
}

const fetchRepoContributors = cache(async (owner: string, repo: string) => {
	const { data } = await octokit.request("GET /repos/{owner}/{repo}/contributors", { owner, repo });

	return data.filter(({ type, login }) => type !== "Bot" && login !== DEFAULT_REPO.owner);
});

export const RepoContributors = async () => {
	const contributors = await fetchRepoContributors(DEFAULT_REPO.owner, DEFAULT_REPO.repo);

	return (
		<div className="flex flex-wrap gap-6 pt-4">
			{contributors?.map(
				({ login, avatar_url, html_url }) =>
					html_url && (
						<LinkTo href={html_url} key={login} target="_blank">
							<div className="flex flex-col items-center gap-1">
								{avatar_url ? (
									<span className="overflow-hidden rounded-global">
										<Image src={avatar_url} alt={login ?? ""} height={128} width={128} />
									</span>
								) : null}
								<p className="m-0 pb-2 text-sm">{login}</p>
							</div>
						</LinkTo>
					),
			)}
		</div>
	);
};
