import { bundleMDX } from "mdx-bundler";

export type TBlogPostFrontmatter = {
	title: string;
	subtitle?: string;
	summary: string;
	image?: string;
	publishedAt: string;
	published: boolean;
};

export type PostDetails = {
	id: number;
	slug: string;
	inserted_at: string;
	updated_at: string;
	view_count: number;
	likes: number;
};

export type PromiseResolvedType<T> = T extends Promise<infer R> ? R : never;

export type TBlogPostPageProps = Omit<
	PromiseResolvedType<ReturnType<typeof bundleMDX>>,
	"frontmatter"
> & {
	frontmatter: TBlogPostFrontmatter;
	slug: string;
};
