import { bundleMDX } from "mdx-bundler";

export type ContentFrontmatterProps = {
	title: string;
	seoTitle?: string;
	subtitle?: string;
	summary: string;
	image?: string;
	published: boolean;
	publishedAt: string;
	updatedAt: string;
	skipPage?: boolean;
};

export type PostDetails = {
	id: number;
	slug: string;
	inserted_at: string;
	updated_at: string;
	view_count: number;
	likes: number;
};

export type MDXBundledResultProps = Omit<Awaited<ReturnType<typeof bundleMDX>>, "frontmatter"> & {
	frontmatter: ContentFrontmatterProps;
	slug: string;
};
