import { isEmpty } from "lodash-es";
import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { SITE_OG_IMAGE, SITE_TITLE_APPEND, SITE_URL } from "@/config";
import { aoc_solutions } from "@/generated";
import { MDXContent } from "@/lib/components/MDX";
import { ReadingProgress } from "@/lib/components/ProgressBar.client";
import { InfoBlock } from "@/lib/components/sink";
import { Blockquote, Highlight } from "@/lib/components/Typography";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { cn } from "@/lib/helpers/utils";

import { ParseInput } from "./pulse-propagation";

export const dynamicParams = false;

type PageParams = {
	params: {
		slug: Array<string>;
	};
};
export function generateStaticParams() {
	return aoc_solutions.map((post) => ({
		slug: post.page_slug.split("/"),
	}));
}

export function generateMetadata({ params: { slug } }: PageParams): Metadata {
	const full_slug = slug.join("/");
	const post = aoc_solutions.find((page) => page.page_slug === full_slug);

	return {
		title: `${post?.seo_title ?? post?.title} ${SITE_TITLE_APPEND}`,
		description: post?.description,
		openGraph: {
			title: `${post?.seo_title ?? post?.title} ${SITE_TITLE_APPEND}`,
			description: post?.description,
			type: "article",
			url: `${SITE_URL}/aoc/${full_slug}`,
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

export default function AdventOfCodeSolutionPage({ params: { slug } }: PageParams) {
	const full_slug = slug.join("/");
	const post = aoc_solutions.find((page) => page.page_slug === full_slug);

	if (!post) notFound();

	const has_subheading = !isEmpty(post.subheading);

	return (
		<>
			<script
				type="application/ld+json"
				suppressHydrationWarning
				dangerouslySetInnerHTML={{ __html: JSON.stringify(post.structured_data) }}
			/>
			<ReadingProgress />
			{has_subheading ? (
				<small className="pt-10 font-serif text-xl">{post.subheading}</small>
			) : null}
			<h1
				className={cn(
					"hyphens-manual pb-20 font-serif text-8xl font-bold tracking-tighter max-sm:text-7xl",
					!has_subheading && "pt-10",
				)}
			>
				<span
					className="whitespace-pre-wrap text-balance bg-gradient-to-r from-primary to-secondary box-decoration-slice bg-clip-text text-transparent"
					dangerouslySetInnerHTML={{ __html: post.title }}
				/>
			</h1>

			<MDXContent
				code={post.code}
				components={{
					blockquote: (props) => (
						<Blockquote
							{...props}
							className="my-5 bg-karma-background font-mono font-light text-[#D7D7D7] dark:bg-karma-background [&_strong]:text-[rgb(var(--dark-blue))]"
						/>
					),
					Highlight,
					InfoBlock,

					ParseInput,
				}}
			/>

			<ViewsCounter slug={post.url ?? post.page_path} />
		</>
	);
}
