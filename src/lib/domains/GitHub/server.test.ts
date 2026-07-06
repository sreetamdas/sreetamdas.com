import { beforeEach, describe, expect, test, vi } from "vitest";

type TestGitHubEnv = Pick<Partial<CloudflareEnv>, "GITHUB_TOKEN">;

const cloudflare = vi.hoisted<{ env: TestGitHubEnv }>(() => ({ env: {} }));

vi.mock("cloudflare:workers", () => cloudflare);

function createCacheMock() {
	const store = new Map<string, Response>();
	const cache: Cache = {
		match: vi.fn(async (key: Request) => store.get(key.url) ?? undefined),
		put: vi.fn(async (key: Request, response: Response) => {
			store.set(key.url, response.clone());
		}),
		delete: vi.fn(async () => true),
	};
	return {
		store,
		match: cache.match,
		put: cache.put,
		reset: () => store.clear(),
		open: vi.fn(async () => cache),
	};
}

import { readGitHubStats } from "./server";

describe("readGitHubStats", () => {
	let cacheMock: ReturnType<typeof createCacheMock>;

	beforeEach(() => {
		cloudflare.env.GITHUB_TOKEN = undefined;
		cacheMock = createCacheMock();
		vi.stubGlobal("caches", { open: cacheMock.open });
	});

	test("returns cached stats without calling the GitHub API", async () => {
		cacheMock.store.set(
			"https://internal.cache/github-stats",
			new Response(JSON.stringify({ stars: 42, forks: 7 }), {
				headers: { "content-type": "application/json" },
			}),
		);

		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);

		const stats = await readGitHubStats();

		expect(stats).toEqual({ stars: 42, forks: 7 });
		expect(fetchMock).not.toHaveBeenCalled();
		expect(cacheMock.match).toHaveBeenCalledTimes(1);
		expect(cacheMock.put).not.toHaveBeenCalled();
	});

	test("fetches from GitHub API on cache miss and stores the result", async () => {
		const fetchMock = vi.fn(async () =>
			Response.json({
				stargazers_count: 100,
				forks_count: 23,
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const stats = await readGitHubStats();

		expect(stats).toEqual({ stars: 100, forks: 23 });
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(cacheMock.put).toHaveBeenCalledTimes(1);

		const [, cachedResponse] = cacheMock.put.mock.calls[0];
		expect(await cachedResponse.json()).toEqual({ stars: 100, forks: 23 });
	});

	test("serves cached stats on the second call without hitting GitHub", async () => {
		const fetchMock = vi.fn(async () =>
			Response.json({
				stargazers_count: 50,
				forks_count: 5,
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		await readGitHubStats();
		const second = await readGitHubStats();

		expect(second).toEqual({ stars: 50, forks: 5 });
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(cacheMock.put).toHaveBeenCalledTimes(1);
	});

	test("falls back to GitHub API when cached value has an invalid shape", async () => {
		cacheMock.store.set(
			"https://internal.cache/github-stats",
			new Response(JSON.stringify({ unexpected: true }), {
				headers: { "content-type": "application/json" },
			}),
		);

		const fetchMock = vi.fn(async () =>
			Response.json({
				stargazers_count: 9,
				forks_count: 1,
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const stats = await readGitHubStats();

		expect(stats).toEqual({ stars: 9, forks: 1 });
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(cacheMock.put).toHaveBeenCalledTimes(1);
	});

	test("returns zeros when the GitHub API fails", async () => {
		const fetchMock = vi.fn(async () => new Response("rate limited", { status: 403 }));
		vi.stubGlobal("fetch", fetchMock);

		const stats = await readGitHubStats();

		expect(stats).toEqual({ stars: 0, forks: 0 });
		expect(cacheMock.put).not.toHaveBeenCalled();
	});
});
