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

import { ParseInput, Part1, ProcessPulses } from "./pulse-propagation";

export const dynamicParams = false;

type PageParams = {
	params: Promise<{
		slug: Array<string>;
	}>;
};
export function generateStaticParams() {
	return aoc_solutions.map((post) => ({
		slug: post.page_slug.split("/"),
	}));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
	const { slug } = await params;
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

export default async function AdventOfCodeSolutionPage({ params }: PageParams) {
	const { slug } = await params;
	const full_slug = slug.join("/");
	const post = aoc_solutions.find((page) => page.page_slug === full_slug);

	if (!post) notFound();

	const has_subheading = !isEmpty(post.subheading);

	return (
		<>
			<script
				type="application/ld+json"
				suppressHydrationWarning
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(post.structured_data),
				}}
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
					className="from-primary to-secondary bg-gradient-to-r box-decoration-slice bg-clip-text text-balance whitespace-pre-wrap text-transparent"
					dangerouslySetInnerHTML={{ __html: post.title }}
				/>
			</h1>

			<MDXContent
				source={post.raw}
				components={{
					blockquote: (props) => (
						<Blockquote
							{...props}
							className="bg-karma-background dark:bg-karma-background my-5 font-mono font-light text-[#D7D7D7] [&_strong]:text-(--dark-blue)"
						/>
					),
					Highlight,
					InfoBlock,

					ParseInput,
					ProcessPulses,
					Part1,
				}}
			/>

			<ViewsCounter slug={post.url ?? post.page_path} />
		</>
	);
}
