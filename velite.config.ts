import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import { defineConfig, s } from "velite";

import { OWNER_NAME, SITE_OG_IMAGE, SITE_URL } from "./src/config";
import { rehypeImgSize } from "./src/lib/components/MDX/plugins";
import { remarkShiki } from "./src/lib/domains/shiki";

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
					url: s.string().optional(),
					image: s.string().optional(),
					use_client: s
						.boolean()
						.default(false)
						.describe("If MDX has client components")
						.optional(),
					page_path: s.path(),
				})
				.transform((data, { meta }) => ({
					...data,
					// computed fields
					page_path: `/${data.page_path}`,
					page_slug: data.page_path.split("/").at(-1),
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
					page_path: `/${data.raw_path.split("/").at(-1)}`,
					page_slug: data.raw_path.split("/").at(-1),
				})),
		},
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
