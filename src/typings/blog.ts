export type TBlogPost = {
	title: string;
	summary: string;
	image?: string;
	publishedAt: string;
	published: boolean;
	slug: string;
	content: string;
};

export type PostDetails = {
	id: number;
	slug: string;
	inserted_at: string;
	updated_at: string;
	view_count: number;
	likes: number;
};
