import { isEmpty, isNil } from "lodash-es";
import { createFileRoute, notFound } from "@tanstack/react-router";
import z from "zod";

import { IS_DEV, SITE_TITLE_APPEND } from "@/config";
import { absoluteUrl, canonicalUrl, defaultOgImageUrl } from "@/lib/seo";
import { aoc_solutions } from "@/generated";
import { MDXContent } from "@/lib/components/MDX";
import { ReadingProgress } from "@/lib/components/ProgressBar.client";
import { InfoBlock } from "@/lib/components/sink";
import { Blockquote, Highlight } from "@/lib/components/Typography";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { cn } from "@/lib/helpers/utils";

import { ParseInput, Part1, ProcessPulses } from "../../-aoc/[...slug]/pulse-propagation";

const routeParams = z.object({
	year: z.string().min(1),
	day: z.string().min(1),
});

export const Route = createFileRoute("/(main)/aoc/$year/$day")({
	component: AdventOfCodeSolutionPage,
	params: {
		parse: (params) => routeParams.parse(params),
	},
	loader: ({ params }) => {
		if (!IS_DEV) {
			throw notFound();
		}

		const fullSlug = `${params.year}/${params.day}`;
		const post = aoc_solutions.find((page) => page.page_slug === fullSlug);

		if (isNil(post)) {
			throw notFound();
		}

		return { post, fullSlug };
	},
	head: ({ loaderData }) => ({
		links: [
			{
				rel: "canonical",
				href: canonicalUrl(`/aoc/${loaderData?.fullSlug ?? ""}`),
			},
		],
		meta: [
			{
				title: `${loaderData?.post.seo_title ?? loaderData?.post.title} ${SITE_TITLE_APPEND}`,
			},
			{ name: "description", content: loaderData?.post.description },
			{
				property: "og:title",
				content: `${loaderData?.post.seo_title ?? loaderData?.post.title} ${SITE_TITLE_APPEND}`,
			},
			{ property: "og:description", content: loaderData?.post.description },
			{ property: "og:type", content: "article" },
			{
				property: "og:url",
				content: canonicalUrl(`/aoc/${loaderData?.fullSlug ?? ""}`),
			},
			{
				property: "og:image",
				content: loaderData?.post.image ? absoluteUrl(loaderData.post.image) : defaultOgImageUrl(),
			},
			{ name: "twitter:card", content: "summary_large_image" },
			{
				name: "twitter:title",
				content: `${loaderData?.post.seo_title ?? loaderData?.post.title} ${SITE_TITLE_APPEND}`,
			},
			{
				name: "twitter:description",
				content: loaderData?.post.description,
			},
			{
				name: "twitter:image",
				content: loaderData?.post.image ? absoluteUrl(loaderData.post.image) : defaultOgImageUrl(),
			},
		],
	}),
});

function AdventOfCodeSolutionPage() {
	const { post } = Route.useLoaderData();
	const hasSubheading = !isEmpty(post.subheading);

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

			{hasSubheading ? <small className="pt-10 font-serif text-xl">{post.subheading}</small> : null}

			<h1
				className={cn(
					"hyphens-manual pb-20 font-serif text-8xl font-bold tracking-tighter max-sm:text-7xl",
					!hasSubheading && "pt-10",
				)}
			>
				<span
					className="from-primary to-secondary bg-gradient-to-r box-decoration-slice bg-clip-text text-balance whitespace-pre-wrap text-transparent"
					dangerouslySetInnerHTML={{ __html: post.title }}
				/>
			</h1>

			<MDXContent
				source={post.raw}
				mdast={post.mdast}
				shikiHighlights={post.shikiHighlights}
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
