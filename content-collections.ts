import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";

import { OWNER_NAME, SITE_OG_IMAGE, SITE_URL } from "./src/config";
import { mdxParseWithShiki } from "./src/lib/components/MDX/parse";

const blogPosts = defineCollection({
	name: "blogPosts",
	directory: "content/blog",
	include: "**/*.mdx",
	schema: z.object({
		title: z.string(),
		seo_title: z.string().optional(),
		description: z.string(),
		published_at: z.string(),
		updated_at: z.string().optional(),
		published: z.boolean(),
		url: z.string().optional(),
		image: z.string().optional(),
		content: z.string(),
	}),
	transform: async (doc) => {
		const raw = doc.content;
		const { mdast, shikiHighlights } = await mdxParseWithShiki(raw);
		const wordCount = raw.split(/\s+/g).filter(Boolean).length;
		const readingTime = Math.max(1, Math.round(wordCount / 238));
		const pageSlug = doc._meta.path.split("/").at(-1) ?? doc._meta.path;
		const pagePath = `/blog/${doc._meta.path}` as `/blog/${string}`;

		return {
			...doc,
			raw,
			raw_path: `blog/${doc._meta.path}`,
			mdast,
			shikiHighlights,
			reading_time: readingTime,
			page_path: pagePath,
			page_slug: pageSlug,
			structured_data: {
				type: "json",
				"@context": "https://schema.org",
				"@type": "BlogPosting",
				headline: doc.title,
				datePublished: doc.published_at,
				dateModified: doc.updated_at,
				description: doc.description,
				image: doc.image ? `${SITE_URL}${doc.image}` : `${SITE_URL}${SITE_OG_IMAGE}`,
				url: `${SITE_URL}${doc.url ?? pagePath}`,
				author: {
					"@type": "Person",
					name: OWNER_NAME,
				},
			},
		};
	},
});

export default defineConfig({
	content: [blogPosts],
});
