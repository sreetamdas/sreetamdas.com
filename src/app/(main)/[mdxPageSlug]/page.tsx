import { notFound } from "next/navigation";

import { MDXContent } from "@/lib/domains/mdx";
import { allPages } from "contentlayer/generated";

export const dynamicParams = false;

export async function generateStaticParams() {
	return allPages.map((post) => ({
		slug: post.page_slug,
	}));
}

type PageParams = {
	params: {
		mdxPageSlug: string;
	};
};
export default function MDXPageSlugPage({ params }: PageParams) {
	const post = allPages.find((page) => page.page_slug === params.mdxPageSlug);

	if (!post) notFound();

	return (
		<>
			<p>mdx slug: {params.mdxPageSlug}</p>
			<MDXContent code={post.body.code} />
		</>
	);
}
