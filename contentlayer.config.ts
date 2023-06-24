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
		seoTitle: { type: "string", required: false },
		description: { type: "string", required: true },
		publishedAt: { type: "date", required: true },
		updatedAt: { type: "date", required: false },
		published: { type: "boolean", required: true },
	},
	computedFields: {
		// url: { type: "string", resolve: (post) => `/posts/${post._raw.flattenedPath}` },
	},
}));
export const Page = defineDocumentType(() => ({
	name: "Page",
	filePathPattern: `**/[mdxPageSlug]/**/*.mdx`,
	contentType: "mdx",
	fields: {
		title: { type: "string", required: true },
		seoTitle: { type: "string", required: false },
		description: { type: "string", required: true },
		publishedAt: { type: "date", required: true },
		updatedAt: { type: "date", required: false },
		published: { type: "boolean", required: true },
	},
	computedFields: {
		// url: { type: "string", resolve: (post) => `/posts/${post._raw.flattenedPath}` },
	},
}));

export default makeSource({
	contentDirPath: "src/app",
	documentTypes: [BlogPost, Page],
	mdx: {
		remarkPlugins: [],
		rehypePlugins: [remarkGfm, remarkSlug, [remarkToc, { tight: true }]],
	},
});
