import { notFound } from "next/navigation";

import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { RepoContributors } from "@/lib/domains/GitHub";
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
export default async function MDXPageSlugPage({ params: { mdxPageSlug } }: PageParams) {
	const post = allPages.find((page) => page.page_slug === mdxPageSlug);

	if (!post) notFound();

	return (
		<>
			<h1 className="py-10 font-serif text-8xl">/{mdxPageSlug}</h1>
			{/* @ts-expect-error async server component */}
			<MDXContent code={post.body.code} components={{ RepoContributors }} />
			<ViewsCounter slug={`/${mdxPageSlug}`} />
		</>
	);
}
