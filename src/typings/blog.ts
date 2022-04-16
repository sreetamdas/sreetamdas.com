import { bundleMDX } from "mdx-bundler";

export type TBlogPostFrontmatter = {
	title: string;
	seoTitle?: string;
	subtitle?: string;
	summary: string;
	image?: string;
	published: boolean;
	publishedAt: string;
	updatedAt: string;
};

export type PostDetails = {
	id: number;
	slug: string;
	inserted_at: string;
	updated_at: string;
	view_count: number;
	likes: number;
};

export type TBlogPostPageProps = Omit<Awaited<ReturnType<typeof bundleMDX>>, "frontmatter"> & {
	frontmatter: TBlogPostFrontmatter;
	slug: string;
};
