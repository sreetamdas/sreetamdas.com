import { type Endpoints } from "@octokit/types";

import { GITHUB_API_BASE_URL, getGitHubHeaders } from "@/lib/domains/GitHub/shared";

const RETRY_DELAYS_MS = [1_000, 4_000, 10_000];
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * The gists API rate limit for unauthenticated requests is 60/hour *per IP*;
 * CI runners and Workers Builds share fleet-wide egress IPs, and GITHUB_TOKEN
 * cannot call this endpoint ("Resource not accessible by integration"), so
 * there is no auth workaround. A 403/429/5xx or a dropped request therefore
 * gets retried with backoff instead of silently degrading /rwc's prerender to
 * the fallback payload (which strips every #pNNN_ex anchor).
 */
export async function fetchGist(gist_id: string, githubToken?: string) {
	for (let attempt = 0; ; attempt += 1) {
		const request = await fetch(`${GITHUB_API_BASE_URL}/gists/${gist_id}`, {
			headers: getGitHubHeaders(githubToken),
		});

		if (request.ok) {
			const data: Endpoints["GET /gists/{gist_id}"]["response"]["data"] = await request.json();

			return data;
		}

		const retryable = [403, 429, 500, 502, 503, 504].includes(request.status);
		const delay = RETRY_DELAYS_MS[attempt];
		if (!retryable || delay === undefined) {
			throw new Error(`Failed to fetch gist: ${request.status}`);
		}

		// oxlint-disable-next-line no-console
		console.error(`[gist] fetch failed with ${request.status}, retrying in ${delay}ms`);
		await sleep(delay);
	}
}
