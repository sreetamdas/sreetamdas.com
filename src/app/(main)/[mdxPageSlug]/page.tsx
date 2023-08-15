import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { SITE_TITLE_APPEND, SITE_URL, SITE_OG_IMAGE } from "@/config";
import { MDXContent } from "@/lib/components/MDX";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { RepoContributors } from "@/lib/domains/GitHub";
import { allPages } from "contentlayer/generated";

export const dynamicParams = false;

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
			<h1 className="pb-20 pt-10 font-serif text-8xl">/{mdxPageSlug}</h1>
			<MDXContent code={post.body.code} components={{ RepoContributors }} />
			<ViewsCounter slug={`/${mdxPageSlug}`} />
		</>
	);
}

export async function generateStaticParams() {
	return allPages.flatMap(({ page_slug, skip_page }) => {
		if (skip_page) return [];

		return {
			mdxPageSlug: page_slug,
		};
	});
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
	const post = allPages.find((page) => page.page_slug === params.mdxPageSlug);

	return {
		title: post?.seo_title ?? post?.title,
		description: post?.description,
		openGraph: {
			title: `${post?.seo_title ?? post?.title} ${SITE_TITLE_APPEND}`,
			description: post?.description,
			type: "article",
			url: `${SITE_URL}/${params.mdxPageSlug}`,
			images: { url: SITE_OG_IMAGE },
		},
		twitter: {
			card: "summary_large_image",
			title: `${post?.seo_title ?? post?.title} ${SITE_TITLE_APPEND}`,
			description: post?.description,
			images: { url: SITE_OG_IMAGE },
		},
	};
}
