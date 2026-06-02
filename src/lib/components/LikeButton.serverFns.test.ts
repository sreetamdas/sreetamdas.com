import { describe, expect, test } from "vitest";

import { fetchLikeCount, incrementLikeCount } from "./LikeButton.serverFns";

describe("fetchLikeCount", () => {
	test("returns zeros for unknown blog slugs without calling deps", async () => {
		const calls: string[] = [];
		const fakeDb = {};
		const deps = {
			getDb: () => {
				calls.push("getDb");
				return fakeDb;
			},
			getLikes: async () => {
				calls.push("getLikes");
				return { likes: 9, hasLiked: true };
			},
			incrementLikes: async () => {
				calls.push("incrementLikes");
				return { likes: 10, hasLiked: true };
			},
			getVisitorHash: async () => {
				calls.push("getVisitorHash");
				return "visitor-hash";
			},
		};

		expect(
			await fetchLikeCount({ slug: "/blog/forged-post", disabled: false }, undefined, deps),
		).toEqual({ likes: 0, hasLiked: false });
		expect(calls).toEqual([]);
	});

	test("returns zeros when the Cloudflare env is unavailable", async () => {
		expect(
			await fetchLikeCount({ slug: "/blog/chameleon-text", disabled: false }, undefined),
		).toEqual({ likes: 0, hasLiked: false });
	});

	test("returns the dependency result for known slugs", async () => {
		const calls: string[] = [];
		const fakeDb = {};
		const deps = {
			getDb: (env: CloudflareEnv | undefined) => {
				calls.push(`getDb:${env === undefined ? "undefined" : "env"}`);
				return fakeDb;
			},
			getLikes: async (db: object, slug: string, visitorHash?: string) => {
				calls.push(`getLikes:${db === fakeDb ? "db" : "other"}:${slug}:${visitorHash}`);
				return { likes: 4, hasLiked: true };
			},
			incrementLikes: async () => {
				calls.push("incrementLikes");
				return { likes: 5, hasLiked: true };
			},
			getVisitorHash: async (env: CloudflareEnv | undefined, normalizedSlug: string) => {
				calls.push(`getVisitorHash:${env === undefined ? "undefined" : "env"}:${normalizedSlug}`);
				return "visitor-hash";
			},
		};

		expect(
			await fetchLikeCount({ slug: "/blog/chameleon-text", disabled: false }, undefined, deps),
		).toEqual({ likes: 4, hasLiked: true });
		expect(calls).toEqual([
			"getDb:undefined",
			"getVisitorHash:undefined:/blog/chameleon-text",
			"getLikes:db:/blog/chameleon-text:visitor-hash",
		]);
	});

	test("fails open when getLikes throws", async () => {
		const fakeDb = {};
		const deps = {
			getDb: () => {
				return fakeDb;
			},
			getLikes: async () => {
				throw new Error("read failed");
			},
			incrementLikes: async () => ({ likes: 5, hasLiked: true }),
			getVisitorHash: async () => "visitor-hash",
		};

		expect(
			await fetchLikeCount({ slug: "/blog/chameleon-text", disabled: false }, undefined, deps),
		).toEqual({ likes: 0, hasLiked: false });
	});

	test("normalizes trailing slashes before reading likes", async () => {
		const calls: string[] = [];
		const fakeDb = {};
		const deps = {
			getDb: () => {
				calls.push("getDb");
				return fakeDb;
			},
			getLikes: async (_db: object, slug: string) => {
				calls.push(`getLikes:${slug}`);
				return { likes: 6, hasLiked: false };
			},
			incrementLikes: async () => {
				calls.push("incrementLikes");
				return { likes: 7, hasLiked: true };
			},
			getVisitorHash: async (_env: CloudflareEnv | undefined, normalizedSlug: string) => {
				calls.push(`getVisitorHash:${normalizedSlug}`);
				return "visitor-hash";
			},
		};

		expect(
			await fetchLikeCount({ slug: "/blog/chameleon-text/", disabled: false }, undefined, deps),
		).toEqual({ likes: 6, hasLiked: false });
		expect(calls).toEqual([
			"getDb",
			"getVisitorHash:/blog/chameleon-text",
			"getLikes:/blog/chameleon-text",
		]);
	});
});

describe("incrementLikeCount", () => {
	test("returns zeros for unknown blog slugs without calling deps", async () => {
		const calls: string[] = [];
		const fakeDb = {};
		const deps = {
			getDb: () => {
				calls.push("getDb");
				return fakeDb;
			},
			getLikes: async () => {
				calls.push("getLikes");
				return { likes: 9, hasLiked: true };
			},
			incrementLikes: async () => {
				calls.push("incrementLikes");
				return { likes: 10, hasLiked: true };
			},
			getVisitorHash: async () => {
				calls.push("getVisitorHash");
				return "visitor-hash";
			},
		};

		expect(
			await incrementLikeCount({ slug: "/blog/forged-post", disabled: false }, undefined, deps),
		).toEqual({ likes: 0, hasLiked: false });
		expect(calls).toEqual([]);
	});

	test("returns zeros when the Cloudflare env is unavailable", async () => {
		expect(
			await incrementLikeCount({ slug: "/blog/chameleon-text", disabled: false }, undefined),
		).toEqual({ likes: 0, hasLiked: false });
	});

	test("reads existing likes when disabled", async () => {
		const calls: string[] = [];
		const fakeDb = {};
		const deps = {
			getDb: () => {
				calls.push("getDb");
				return fakeDb;
			},
			getLikes: async (_db: object, slug: string, visitorHash?: string) => {
				calls.push(`getLikes:${slug}:${visitorHash}`);
				return { likes: 4, hasLiked: true };
			},
			incrementLikes: async () => {
				calls.push("incrementLikes");
				return { likes: 5, hasLiked: true };
			},
			getVisitorHash: async (_env: CloudflareEnv | undefined, normalizedSlug: string) => {
				calls.push(`getVisitorHash:${normalizedSlug}`);
				return "visitor-hash";
			},
		};

		expect(
			await incrementLikeCount({ slug: "/blog/chameleon-text", disabled: true }, undefined, deps),
		).toEqual({ likes: 4, hasLiked: true });
		expect(calls).toEqual([
			"getDb",
			"getVisitorHash:/blog/chameleon-text",
			"getLikes:/blog/chameleon-text:visitor-hash",
		]);
	});

	test("reads existing likes when the visitor hash is unavailable", async () => {
		const calls: string[] = [];
		const fakeDb = {};
		const deps = {
			getDb: () => {
				calls.push("getDb");
				return fakeDb;
			},
			getLikes: async (_db: object, slug: string, visitorHash?: string) => {
				calls.push(`getLikes:${slug}:${visitorHash}`);
				return { likes: 4, hasLiked: false };
			},
			incrementLikes: async () => {
				calls.push("incrementLikes");
				return { likes: 5, hasLiked: true };
			},
			getVisitorHash: async (_env: CloudflareEnv | undefined, normalizedSlug: string) => {
				calls.push(`getVisitorHash:${normalizedSlug}`);
				return undefined;
			},
		};

		expect(
			await incrementLikeCount({ slug: "/blog/chameleon-text", disabled: false }, undefined, deps),
		).toEqual({ likes: 4, hasLiked: false });
		expect(calls).toEqual([
			"getDb",
			"getVisitorHash:/blog/chameleon-text",
			"getLikes:/blog/chameleon-text:undefined",
		]);
	});

	test("increments likes when enabled and the visitor hash is present", async () => {
		const calls: string[] = [];
		const fakeDb = {};
		const deps = {
			getDb: () => {
				calls.push("getDb");
				return fakeDb;
			},
			getLikes: async () => {
				calls.push("getLikes");
				return { likes: 4, hasLiked: false };
			},
			incrementLikes: async (db: object, slug: string, visitorHash: string) => {
				calls.push(`incrementLikes:${db === fakeDb ? "db" : "other"}:${slug}:${visitorHash}`);
				return { likes: 5, hasLiked: true };
			},
			getVisitorHash: async (_env: CloudflareEnv | undefined, normalizedSlug: string) => {
				calls.push(`getVisitorHash:${normalizedSlug}`);
				return "visitor-hash";
			},
		};

		expect(
			await incrementLikeCount({ slug: "/blog/chameleon-text", disabled: false }, undefined, deps),
		).toEqual({ likes: 5, hasLiked: true });
		expect(calls).toEqual([
			"getDb",
			"getVisitorHash:/blog/chameleon-text",
			"incrementLikes:db:/blog/chameleon-text:visitor-hash",
		]);
	});
});
