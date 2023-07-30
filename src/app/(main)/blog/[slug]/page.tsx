import { notFound } from "next/navigation";
import { Balancer } from "react-wrap-balancer";

import { MDXContent, Gradient, InfoBlock } from "@/lib/components/MDX";
import { ReadingProgress } from "@/lib/components/ProgressBar";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
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
			<ReadingProgress />
			<h1 className="pb-20 pt-10 font-serif text-8xl">
				<Balancer>
					<Gradient>{post.title}</Gradient>
				</Balancer>
			</h1>
			<MDXContent code={post.body.code} components={{ Gradient, InfoBlock }} />
			<ViewsCounter slug={post.page_path} />
		</>
	);
}
