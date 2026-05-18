import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";

import { OWNER_NAME, SITE_OG_IMAGE, SITE_URL } from "./src/config";
import { mdxParseWithShiki } from "./src/lib/components/MDX/parse";

type StructuredDataInput = {
	title: string;
	published_at: string;
	updated_at?: string;
	description?: string;
	image?: string;
	url?: string;
	fallbackPath: string;
};

function toStructuredData(input: StructuredDataInput) {
	return {
		type: "json",
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: input.title,
		datePublished: input.published_at,
		dateModified: input.updated_at,
		description: input.description,
		image: input.image ? `${SITE_URL}${input.image}` : `${SITE_URL}${SITE_OG_IMAGE}`,
		url: `${SITE_URL}${input.url ?? input.fallbackPath}`,
		author: {
			"@type": "Person",
			name: OWNER_NAME,
		},
	};
}

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
		use_client: z.boolean().optional().default(false),
		content: z.string(),
	}),
	transform: async (doc) => {
		const raw = doc.content;
		const rawPath = `blog/${doc._meta.path}`;
		const pagePath = `/${rawPath}` as `/blog/${string}`;
		const pageSlug = rawPath.split("/").at(-1) ?? doc._meta.path;
		const { mdast, shikiHighlights } = await mdxParseWithShiki(raw);
		const wordCount = raw.split(/\s+/g).filter(Boolean).length;
		const readingTime = Math.max(1, Math.round(wordCount / 238));

		return {
			...doc,
			code: raw,
			raw,
			raw_path: rawPath,
			mdast,
			shikiHighlights,
			reading_time: readingTime,
			page_path: pagePath,
			page_slug: pageSlug,
			structured_data: toStructuredData({ ...doc, fallbackPath: pagePath }),
		};
	},
});

const rootPages = defineCollection({
	name: "rootPages",
	directory: "content/rootPage",
	include: "**/*.mdx",
	schema: z.object({
		title: z.string(),
		seo_title: z.string().optional(),
		description: z.string(),
		published_at: z.string(),
		updated_at: z.string().optional(),
		published: z.boolean(),
		skip_page: z.boolean().optional().default(false),
		content: z.string(),
	}),
	transform: async (doc) => {
		const raw = doc.content;
		const rawPath = `rootPage/${doc._meta.path}`;
		const pageSlug = rawPath.split("/").at(-1) ?? doc._meta.path;
		const pagePath = `/${pageSlug}` as `/${string}`;
		const { mdast, shikiHighlights } = await mdxParseWithShiki(raw);

		return {
			...doc,
			code: raw,
			raw,
			raw_path: rawPath,
			mdast,
			shikiHighlights,
			page_path: pagePath,
			page_slug: pageSlug,
		};
	},
});

const aocSolutions = defineCollection({
	name: "aocSolutions",
	directory: "content/aoc",
	include: "**/*.mdx",
	schema: z.object({
		title: z.string(),
		seo_title: z.string().optional(),
		subheading: z.string().optional(),
		description: z.string().optional(),
		published_at: z.string(),
		updated_at: z.string().optional(),
		published: z.boolean(),
		url: z.string().optional(),
		image: z.string().optional(),
		content: z.string(),
	}),
	transform: async (doc) => {
		const raw = doc.content;
		const rawPath = `aoc/${doc._meta.path}`;
		const pagePath = `/${rawPath}` as `/${string}`;
		const pageSlug = rawPath.split("/").slice(-2).join("/");
		const { mdast, shikiHighlights } = await mdxParseWithShiki(raw);

		return {
			...doc,
			code: raw,
			raw,
			raw_path: rawPath,
			mdast,
			shikiHighlights,
			page_path: pagePath,
			page_slug: pageSlug,
			structured_data: toStructuredData({ ...doc, fallbackPath: pagePath }),
		};
	},
});

export default defineConfig({
	content: [blogPosts, rootPages, aocSolutions],
});
