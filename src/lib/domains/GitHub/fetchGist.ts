import { type Endpoints } from "@octokit/types";

import { GITHUB_API_BASE_URL, getGitHubHeaders } from "@/lib/domains/GitHub/shared";

export async function fetchGist(gist_id: string, githubToken?: string) {
	const request = await fetch(`${GITHUB_API_BASE_URL}/gists/${gist_id}`, {
		headers: getGitHubHeaders(githubToken),
	});

	if (!request.ok) {
		throw new Error(`Failed to fetch gist: ${request.status}`);
	}

	const data: Endpoints["GET /gists/{gist_id}"]["response"]["data"] = await request.json();

	return data;
}
