import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { Balancer } from "react-wrap-balancer";

import {
	HighlightWithUseEffect,
	HighlightWithUseInterval,
} from "./chameleon-text/components.client";

import { SITE_OG_IMAGE, SITE_TITLE_APPEND, SITE_URL } from "@/config";
import { MDXContent, MDXClientContent } from "@/lib/components/MDX";
import { ReadingProgress } from "@/lib/components/ProgressBar.client";
import { Gradient } from "@/lib/components/Typography";
import {
	ChameleonHighlight,
	Sparkles,
	Gradient as GradientClient,
} from "@/lib/components/Typography.client";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { InfoBlock } from "@/lib/components/sink";
import { InfoBlock as InfoBlockClient } from "@/lib/components/sink.client";
import { allBlogPosts } from "contentlayer/generated";

export const dynamicParams = false;

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
	const post = allBlogPosts.find((page) => page.page_slug === params.slug);

	return {
		title: `${post?.seo_title ?? post?.title} ${SITE_TITLE_APPEND}`,
		description: post?.description,
		openGraph: {
			title: `${post?.seo_title ?? post?.title} ${SITE_TITLE_APPEND}`,
			description: post?.description,
			type: "article",
			url: `${SITE_URL}/blog/${params.slug}`,
			images: { url: post?.image ?? SITE_OG_IMAGE },
		},
		twitter: {
			card: "summary_large_image",
			title: `${post?.seo_title ?? post?.title} ${SITE_TITLE_APPEND}`,
			description: post?.description,
			images: { url: post?.image ?? SITE_OG_IMAGE },
		},
	};
}

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
			<script
				type="application/ld+json"
				suppressHydrationWarning
				dangerouslySetInnerHTML={{ __html: JSON.stringify(post.structuredData) }}
			></script>
			<ReadingProgress />
			<h1 className="pb-20 pt-10 font-serif text-8xl">
				<Balancer>
					<Gradient>{post.title}</Gradient>
				</Balancer>
			</h1>
			{post.use_client ? (
				<MDXClientContent
					code={post.body.code}
					components={{
						ChameleonHighlight,
						Gradient: GradientClient,
						InfoBlock: InfoBlockClient,
						Sparkles,

						// Post specific components
						HighlightWithUseEffect,
						HighlightWithUseInterval,
					}}
				/>
			) : (
				<MDXContent
					code={post.body.code}
					components={{
						ChameleonHighlight,
						Gradient,
						InfoBlock,
						Sparkles,

						// Post specific components
					}}
				/>
			)}
			<ViewsCounter slug={post.url ?? post.page_path} />
		</>
	);
}
