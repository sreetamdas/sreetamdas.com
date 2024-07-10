import { defineDocumentType, makeSource } from "contentlayer2/source-files";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";

import { OWNER_NAME, SITE_OG_IMAGE, SITE_URL } from "./src/config";
import { rehypeImgSize } from "./src/lib/components/MDX/plugins";
import { remarkShiki } from "./src/lib/domains/shiki";

export const BlogPost = defineDocumentType(() => ({
	name: "BlogPost",
	filePathPattern: `**/blog/[slug]/**/*.mdx`,
	contentType: "mdx",
	fields: {
		title: { type: "string", required: true },
		seo_title: { type: "string", required: false, description: "Title shown in search results" },
		description: { type: "string", required: true },
		published_at: { type: "date", required: true },
		updated_at: { type: "date", required: false },
		published: { type: "boolean", required: true },
		url: { type: "string", required: false },
		image: { type: "string", required: false },
		use_client: {
			type: "boolean",
			description: "If MDX has client components",
			required: false,
			default: false,
		},
	},
	computedFields: {
		page_path: {
			type: "string",
			description: "URL pathname for post",
			resolve: (post) => {
				const flattened_path = post._raw.flattenedPath;
				const cleaned_path = flattened_path.replace("(main)/blog/[slug]/", "blog/");

				return `/${cleaned_path}`;
			},
		},
		page_slug: {
			type: "string",
			description: "slug used in the URL of the page",
			resolve: (post) => {
				const flattened_path = post._raw.flattenedPath;
				const cleaned_slug = flattened_path.split("/").at(-1);

				return cleaned_slug;
			},
		},
		structuredData: {
			type: "json",
			resolve: (post) => {
				const cleaned_path = `/${post._raw.flattenedPath.replace("(main)/blog/[slug]/", "blog/")}`;

				return {
					"@context": "https://schema.org",
					"@type": "BlogPosting",
					headline: post.title,
					datePublished: post.published_at,
					dateModified: post.updated_at,
					description: post.description,
					image: post.image ? `${SITE_URL}${post.image}` : `${SITE_URL}${SITE_OG_IMAGE}`,
					url: `${SITE_URL}${post?.url ?? cleaned_path}`,
					author: {
						"@type": "Person",
						name: OWNER_NAME,
					},
				};
			},
		},
	},
}));
export const Page = defineDocumentType(() => ({
	name: "Page",
	filePathPattern: `**/[mdxPageSlug]/*.mdx`,
	contentType: "mdx",
	fields: {
		title: { type: "string", required: true },
		seo_title: { type: "string", required: false, description: "Title shown in search results" },
		description: { type: "string", required: true },
		published_at: { type: "date", required: true },
		updated_at: { type: "date", required: false },
		published: { type: "boolean", required: true },
		skip_page: {
			type: "boolean",
			required: false,
			default: false,
			description: "To skip a page from being an explicit route segment",
		},
	},
	computedFields: {
		page_path: {
			type: "string",
			description: "URL pathname for post",
			resolve: (post) => {
				const flattened_path = post._raw.flattenedPath;
				const cleaned_path = flattened_path.replace("(main)/[mdxPageSlug]/", "");

				return `/${cleaned_path}`;
			},
		},
		page_slug: {
			type: "string",
			description: "slug used in the URL of the page",
			resolve: (post) => {
				const flattened_path = post._raw.flattenedPath;
				const cleaned_slug = flattened_path.split("/").at(-1);

				return cleaned_slug;
			},
		},
	},
}));

export default makeSource({
	contentDirPath: "src/app",
	contentDirExclude: [
		"node_modules",
		".git",
		".yarn",
		".cache",
		".next",
		".contentlayer",
		"package.json",
		"tsconfig.json",
		"*.ts",
		"*/**/*.ts",
		"*.tsx",
		"*/**/*.tsx",
		"*.css",
		"*/**/*.css",
		"*.png",
		"*/**/*.png",
	],
	documentTypes: [BlogPost, Page],
	mdx: {
		resolveCwd: "relative",
		remarkPlugins: [remarkFrontmatter, remarkShiki, remarkGfm, [remarkToc, { tight: true }]],
		rehypePlugins: [
			[
				// @ts-expect-error TS shush
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
		esbuildOptions(options) {
			options.platform = "node";
			options.define = {
				"process.env": JSON.stringify(process.env),
			};

			return options;
		},
	},
});
