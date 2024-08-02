import { type Route } from "next";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import { type Schema, defineCollection, defineConfig, s } from "velite";

import { OWNER_NAME, SITE_OG_IMAGE, SITE_URL } from "./src/config";
import { rehypeImgSize } from "./src/lib/components/MDX/plugins";
import { remarkShiki } from "./src/lib/domains/shiki";

const aoc_solutions = defineCollection({
	name: "AdventOfCode",
	pattern: "aoc/**/*.mdx",
	schema: s
		.object({
			title: s.string(),
			seo_title: s.string().describe("Title shown in search results").optional(),
			subheading: s.string().describe("Subheading right above the title").optional(),
			description: s.string().optional(),
			published_at: s.isodate(),
			updated_at: s.isodate().optional(),
			code: s.mdx(),
			published: s.boolean(),
			url: s.string().optional() as Schema<Route<`/blog/${string}`>>,
			image: s.string().optional(),
			raw_path: s.path(),
		})
		.transform((data, { meta }) => ({
			...data,
			// computed fields
			page_path: `/${data.raw_path}` as Route<`/blog/${string}`>,
			page_slug: data.raw_path.split("/").slice(-2).join("/"),
			structured_data: {
				type: "json",
				"@context": "https://schema.org",
				"@type": "BlogPosting",
				headline: data.title,
				datePublished: data.published_at,
				dateModified: data.updated_at,
				description: data.description,
				image: data.image ? `${SITE_URL}${data.image}` : `${SITE_URL}${SITE_OG_IMAGE}`,
				url: `${SITE_URL}${data?.url ?? meta.path}`,
				author: {
					"@type": "Person",
					name: OWNER_NAME,
				},
			},
		})),
});

export default defineConfig({
	collections: {
		blogPosts: {
			name: "BlogPost",
			pattern: "blog/**/*.mdx",
			schema: s
				.object({
					title: s.string(),
					seo_title: s.string().describe("Title shown in search results").optional(),
					description: s.string(),
					published_at: s.isodate(),
					updated_at: s.isodate().optional(),
					published: s.boolean(),
					code: s.mdx(),
					url: s.string().optional() as Schema<Route<`/blog/${string}`>>,
					image: s.string().optional(),
					use_client: s
						.boolean()
						.default(false)
						.describe("If MDX has client components")
						.optional(),
					raw_path: s.path(),
				})
				.transform((data, { meta }) => ({
					...data,
					// computed fields
					page_path: `/${data.raw_path}` as Route<`/blog/${string}`>,
					page_slug: data.raw_path.split("/").at(-1),
					structured_data: {
						type: "json",
						"@context": "https://schema.org",
						"@type": "BlogPosting",
						headline: data.title,
						datePublished: data.published_at,
						dateModified: data.updated_at,
						description: data.description,
						image: data.image ? `${SITE_URL}${data.image}` : `${SITE_URL}${SITE_OG_IMAGE}`,
						url: `${SITE_URL}${data?.url ?? meta.path}`,
						author: {
							"@type": "Person",
							name: OWNER_NAME,
						},
					},
				})),
		},

		rootPages: {
			name: "RootPage",
			pattern: "rootPage/**/*.mdx",
			schema: s
				.object({
					title: s.string(),
					seo_title: s.string().describe("Title shown in search results").optional(),
					description: s.string(),
					published_at: s.isodate(),
					updated_at: s.isodate().optional(),
					published: s.boolean(),
					code: s.mdx(),
					skip_page: s
						.boolean()
						.default(false)
						.describe("To skip a page from being an explicit route segment")
						.optional(),
					raw_path: s.path(),
				})
				.transform((data) => ({
					...data,
					// computed fields
					page_path: `/${data.raw_path.split("/").at(-1)}` as Route<`/${string}`>,
					page_slug: data.raw_path.split("/").at(-1),
				})),
		},
		aoc_solutions,
	},
	mdx: {
		remarkPlugins: [remarkFrontmatter, remarkShiki, remarkGfm, [remarkToc, { tight: true }]],
		rehypePlugins: [
			[
				rehypeRaw,
				{
					passThrough: [
						"mdxFlowExpression",
						"mdxJsxFlowElement",
						"mdxJsxTextElement",
						"mdxTextExpression",
						"mdxjsEsm",
					],
				},
			],
			rehypeSlug,
			[rehypeImgSize, { dir: "public" }],
		],
	},
});
