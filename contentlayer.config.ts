import { defineDocumentType, makeSource } from "contentlayer/source-files";
import remarkGfm from "remark-gfm";
import remarkSlug from "remark-slug";
import remarkToc from "remark-toc";

export const BlogPost = defineDocumentType(() => ({
	name: "BlogPost",
	filePathPattern: `**/blog/**/*.mdx`,
	contentType: "mdx",
	fields: {
		title: { type: "string", required: true },
		seo_title: { type: "string", required: false },
		description: { type: "string", required: true },
		published_at: { type: "date", required: true },
		updated_at: { type: "date", required: false },
		published: { type: "boolean", required: true },
	},
	computedFields: {
		// url: { type: "string", resolve: (post) => `/posts/${post._raw.flattenedPath}` },
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
				const cleaned_path = flattened_path.replace("(main)/blog/[slug]/", "");

				return cleaned_path;
			},
		},
	},
}));
export const Page = defineDocumentType(() => ({
	name: "Page",
	filePathPattern: `**/[mdxPageSlug]/**/*.mdx`,
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
				const cleaned_path = flattened_path.replace("(main)/[mdxPageSlug]/", "");

				return cleaned_path;
			},
		},
	},
}));

export default makeSource({
	contentDirPath: "src/app",
	documentTypes: [BlogPost, Page],
	mdx: {
		resolveCwd: "relative",
		remarkPlugins: [],
		rehypePlugins: [remarkGfm, remarkSlug, [remarkToc, { tight: true }]],
		esbuildOptions(options) {
			options.platform = "node";
			options.define = {
				"process.env": JSON.stringify(process.env),
			};

			return options;
		},
	},
});
