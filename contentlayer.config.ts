import { defineDocumentType, makeSource } from "contentlayer/source-files";
import rehypeRaw from "rehype-raw";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkSlug from "remark-slug";
import remarkToc from "remark-toc";

import { remarkShiki } from "./src/lib/domains/shiki";

export const BlogPost = defineDocumentType(() => ({
	name: "BlogPost",
	filePathPattern: `**/blog/[slug]/**/*.mdx`,
	contentType: "mdx",
	fields: {
		title: { type: "string", required: true },
		seo_title: { type: "string", required: false },
		description: { type: "string", required: true },
		published_at: { type: "date", required: true },
		updated_at: { type: "date", required: false },
		published: { type: "boolean", required: true },
		url: { type: "string", required: false },
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
			resolve: (post) => {
				const flattened_path = post._raw.flattenedPath;
				const cleaned_path = flattened_path.replace("(main)/blog/[slug]/", "blog/");

				return `/${cleaned_path}`;
			},
		},
		page_slug: {
			type: "string",
			resolve: (post) => {
				const flattened_path = post._raw.flattenedPath;
				const cleaned_slug = flattened_path.split("/").at(-1);

				return cleaned_slug;
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
		seo_title: { type: "string", required: false },
		description: { type: "string", required: true },
		published_at: { type: "date", required: true },
		updated_at: { type: "date", required: false },
		published: { type: "boolean", required: true },
		skip_page: { type: "boolean", required: false, default: false },
	},
	computedFields: {
		page_path: {
			type: "string",
			resolve: (post) => {
				const flattened_path = post._raw.flattenedPath;
				const cleaned_path = flattened_path.replace("(main)/[mdxPageSlug]/", "");

				return `/${cleaned_path}`;
			},
		},
		page_slug: {
			type: "string",
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
		"*/**/*.ts",
		"*/**/*.tsx",
	],
	documentTypes: [BlogPost, Page],
	mdx: {
		resolveCwd: "relative",
		remarkPlugins: [
			remarkFrontmatter,
			remarkShiki,
			remarkGfm,
			remarkSlug,
			[remarkToc, { tight: true }],
		],
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
