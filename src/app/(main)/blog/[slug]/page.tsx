import { notFound } from "next/navigation";

import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { MDXContent } from "@/lib/domains/mdx";
import { Highlight, Gradient } from "@/lib/domains/mdx/utilities";
import { allBlogPosts } from "contentlayer/generated";

export const dynamicParams = false;

export async function generateStaticParams() {
	return allBlogPosts.map((post) => ({
		slug: post.page_slug,
	}));
}

type PageParams = {
	params: {
		slug: string;
	};
};
export default function BlogPage({ params }: PageParams) {
	const post = allBlogPosts.find((page) => page.page_slug === params.slug);

	if (!post) notFound();

	return (
		<>
			<h1 className="py-10 font-serif text-8xl">{post.title}</h1>
			<MDXContent code={post.body.code} components={{ Highlight, Gradient }} />
			<ViewsCounter slug={post.page_path} />
		</>
	);
}
