/**
 * Tag helpers for blog posts.
 *
 * These are pure functions over a structural post shape rather than importing
 * `content-collections`, so routes and tests can pass plain objects in.
 * `tagSlugs[i]` is always the slug of `tags[i]`; the collection transform
 * normalizes both so callers never re-slugify.
 */
import { shouldServeBlogPost } from "./visibility";

export type TaggablePost = {
	tags: Array<string>;
	tagSlugs: Array<string>;
	published: boolean;
	page_slug: string;
	page_path: string;
	url?: string;
	title: string;
	description: string;
	published_at: string;
	reading_time?: number;
};

export type BlogTag = {
	name: string;
	slug: string;
	count: number;
};

type TagOptions = {
	includeDrafts: boolean;
};

/**
 * Lowercases, turns spaces/underscores into dashes, and strips everything
 * outside `[a-z0-9-]`. Returns an empty string when nothing usable remains;
 * the collection transform turns that into a build error.
 */
export function slugifyTag(tag: string): string {
	return tag
		.toLowerCase()
		.trim()
		.replaceAll(/[\s_]+/g, "-")
		.replaceAll(/[^a-z0-9-]/g, "")
		.replaceAll(/-{2,}/g, "-")
		.replaceAll(/^-|-$/g, "");
}

export function getAllTags(
	posts: Array<TaggablePost>,
	{ includeDrafts }: TagOptions,
): Array<BlogTag> {
	const tags = new Map<string, BlogTag>();

	for (const post of posts) {
		if (!shouldServeBlogPost(post, { includeDrafts })) {
			continue;
		}

		post.tagSlugs.forEach((slug, index) => {
			const tag = tags.get(slug);
			if (tag) {
				tag.count += 1;
				return;
			}

			tags.set(slug, { name: post.tags[index], slug, count: 1 });
		});
	}

	return Array.from(tags.values()).toSorted(
		(a, b) => b.count - a.count || a.name.localeCompare(b.name),
	);
}

export function getPostsByTag(
	posts: Array<TaggablePost>,
	slug: string,
	{ includeDrafts }: TagOptions,
): Array<TaggablePost> {
	return posts
		.filter((post) => shouldServeBlogPost(post, { includeDrafts }) && post.tagSlugs.includes(slug))
		.toSorted((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
}
