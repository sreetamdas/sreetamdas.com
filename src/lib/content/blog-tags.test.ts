import { describe, expect, test } from "vitest";

import { getAllTags, getPostsByTag, slugifyTag, type TaggablePost } from "./blog-tags";

function makePost(overrides: Partial<TaggablePost> = {}): TaggablePost {
	return {
		tags: [],
		tagSlugs: [],
		published: true,
		page_slug: "post",
		page_path: "/blog/post",
		title: "Post",
		description: "",
		published_at: "2021-01-01T00:00:00.000Z",
		reading_time: 1,
		...overrides,
	};
}

describe("slugifyTag", () => {
	test("lowercases display names", () => {
		expect(slugifyTag("React")).toBe("react");
	});

	test("strips punctuation without leaving an extension", () => {
		expect(slugifyTag("Next.js")).toBe("nextjs");
		expect(slugifyTag("C++")).toBe("c");
		expect(slugifyTag("Node.js")).toBe("nodejs");
	});

	test("turns spaces and underscores into dashes", () => {
		expect(slugifyTag("open source")).toBe("open-source");
		expect(slugifyTag("open_source")).toBe("open-source");
		expect(slugifyTag("  TypeScript  ")).toBe("typescript");
	});

	test("collapses duplicate dashes and trims the edges", () => {
		expect(slugifyTag("--hello--world--")).toBe("hello-world");
	});

	test("returns an empty string when nothing usable remains", () => {
		expect(slugifyTag("!!!")).toBe("");
		expect(slugifyTag("   ")).toBe("");
	});
});

describe("getAllTags", () => {
	const posts = [
		makePost({
			tags: ["React", "TypeScript"],
			tagSlugs: ["react", "typescript"],
			page_slug: "a",
		}),
		makePost({
			tags: ["react", "CSS"],
			tagSlugs: ["react", "css"],
			page_slug: "b",
		}),
		makePost({
			tags: ["React"],
			tagSlugs: ["react"],
			page_slug: "c",
			published_at: "2022-01-01T00:00:00.000Z",
		}),
	];

	test("counts posts per tag, sorted by count then name", () => {
		expect(getAllTags(posts, { includeDrafts: false })).toEqual([
			{ name: "React", slug: "react", count: 3 },
			{ name: "CSS", slug: "css", count: 1 },
			{ name: "TypeScript", slug: "typescript", count: 1 },
		]);
	});

	test("keeps the first-seen display casing for a shared slug", () => {
		const tags = getAllTags(posts, { includeDrafts: false });
		expect(tags.find((tag) => tag.slug === "react")?.name).toBe("React");
	});

	test("ignores posts without tags", () => {
		expect(getAllTags([makePost()], { includeDrafts: false })).toEqual([]);
	});

	test("excludes unpublished posts unless drafts are included", () => {
		const withDraft = [
			makePost({ tags: ["CSS"], tagSlugs: ["css"] }),
			makePost({ tags: ["CSS"], tagSlugs: ["css"], published: false }),
		];

		expect(getAllTags(withDraft, { includeDrafts: false })).toEqual([
			{ name: "CSS", slug: "css", count: 1 },
		]);
		expect(getAllTags(withDraft, { includeDrafts: true })).toEqual([
			{ name: "CSS", slug: "css", count: 2 },
		]);
	});
});

describe("getPostsByTag", () => {
	const posts = [
		makePost({
			page_slug: "older",
			tags: ["CSS"],
			tagSlugs: ["css"],
			published_at: "2020-01-01T00:00:00.000Z",
		}),
		makePost({
			page_slug: "newer",
			tags: ["CSS"],
			tagSlugs: ["css"],
			published_at: "2022-01-01T00:00:00.000Z",
		}),
		makePost({ page_slug: "other", tags: ["React"], tagSlugs: ["react"] }),
	];

	test("returns only posts for the tag, newest first", () => {
		expect(
			getPostsByTag(posts, "css", { includeDrafts: false }).map((post) => post.page_slug),
		).toEqual(["newer", "older"]);
	});

	test("returns an empty list for an unknown slug", () => {
		expect(getPostsByTag(posts, "unknown", { includeDrafts: false })).toEqual([]);
	});

	test("excludes unpublished posts unless drafts are included", () => {
		const withDraft = [
			makePost({ page_slug: "live", tags: ["CSS"], tagSlugs: ["css"] }),
			makePost({ page_slug: "draft", tags: ["CSS"], tagSlugs: ["css"], published: false }),
		];

		expect(
			getPostsByTag(withDraft, "css", { includeDrafts: false }).map((post) => post.page_slug),
		).toEqual(["live"]);
		expect(
			getPostsByTag(withDraft, "css", { includeDrafts: true }).map((post) => post.page_slug),
		).toEqual(["live", "draft"]);
	});
});

describe("tag slug invariant", () => {
	// Mirrors `prerender.filter` in vite.config.ts and the asset guard in
	// scripts/check-prerendered-pages.ts: a slug that looks like a file
	// extension would never be prerendered, so the tag page would silently 404.
	const looksLikeAssetPath = (path: string) => /\.[a-z0-9]+$/i.test(path);

	test("generated tag pages are never treated as asset paths", () => {
		const samples = ["React", "Next.js", "C++", "open source", "TypeScript", "Node.js"];

		for (const sample of samples) {
			const slug = slugifyTag(sample);
			expect(slug).not.toBe("");
			expect(looksLikeAssetPath(`/blog/tag/${slug}`)).toBe(false);
		}
	});

	test("slugs from the tag index produce crawlable page paths", () => {
		const posts = [
			makePost({ tags: ["Next.js", "C++"], tagSlugs: ["nextjs", "c"] }),
			makePost({ tags: ["Next.js", "C++"], tagSlugs: ["nextjs", "c"] }),
		];

		for (const tag of getAllTags(posts, { includeDrafts: false })) {
			expect(looksLikeAssetPath(`/blog/tag/${tag.slug}`)).toBe(false);
		}
	});
});
