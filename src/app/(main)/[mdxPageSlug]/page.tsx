import { notFound } from "next/navigation";
import { useMDXComponent } from "next-contentlayer/hooks";
import { Suspense } from "react";

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
	console.log({ allPages: allPages.map((page) => page.page_slug), params });

	const post = allPages.find((page) => page.page_slug === params.mdxPageSlug);

	if (!post) notFound();

	const MDXContent = useMDXComponent(post.body.code);

	return (
		<>
			<p>mdx slug: {params.mdxPageSlug}</p>
			<Suspense>
				<MDXContent />
			</Suspense>
		</>
	);
}
