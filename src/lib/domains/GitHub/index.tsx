import { type Endpoints } from "@octokit/types";
import { createServerFn } from "@tanstack/react-start";
import { DEFAULT_REPO } from "@/config";

export const GITHUB_API_BASE_URL = "https://api.github.com";
const octokit_headers = {
	Accept: "application/vnd.github+json",
	Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
	"X-GitHub-Api-Version": "2022-11-28",
};

export const fetchGitHubStats = createServerFn({ method: "GET" }).handler(async () => {
	const request = await fetch(
		`${GITHUB_API_BASE_URL}/repos/${DEFAULT_REPO.owner}/${DEFAULT_REPO.repo}`,
		{
			headers: octokit_headers,
			next: { revalidate: 3600 },
		},
	);
	const data: Endpoints["GET /repos/{owner}/{repo}"]["response"]["data"] = await request.json();
	const { stargazers_count: stars, forks_count: forks } = data;

	return { stars, forks };
});

// export const getGitHubStats = createServerFn({ method: "GET" }).handler(async () => {
// 	try {
// 		const { data } = useQuery({
// 			queryKey: ["github-stats"],
// 			queryFn: fetchGitHubStats,
// 			staleTime: Infinity,
// 			initialData: { stars: 0, forks: 0 },
// 		});
// 		return data;
// 	} catch (_error) {
// 		return { stars: 0, forks: 0 };
// 	}
// });

export async function fetchRepoContributors() {
	const request = await fetch(
		`${GITHUB_API_BASE_URL}/repos/${DEFAULT_REPO.owner}/${DEFAULT_REPO.repo}/contributors`,
		{
			headers: octokit_headers,
			next: { revalidate: 3600 },
		},
	);
	const data: Endpoints["GET /repos/{owner}/{repo}/contributors"]["response"]["data"] =
		await request.json();

	return data.filter(({ type, login }) => type !== "Bot" && login !== DEFAULT_REPO.owner);
}

export async function fetchGist(gist_id: string) {
	const request = await fetch(`${GITHUB_API_BASE_URL}/gists/${gist_id}`, {
		headers: octokit_headers,
		next: { revalidate: 3600 },
	});
	const data: Endpoints["GET /gists/{gist_id}"]["response"]["data"] = await request.json();

	return data;
}
