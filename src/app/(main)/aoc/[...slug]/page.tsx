import { aoc_solutions } from "@/generated";
import { MDXContent } from "@/lib/components/MDX";
import { ReadingProgress } from "@/lib/components/ProgressBar.client";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import type { Route } from "next";
import { notFound } from "next/navigation";
import Balancer from "react-wrap-balancer";

export const dynamicParams = false;

type PageParams = {
	params: {
		slug: Array<string>;
	};
};
export async function generateStaticParams() {
	return aoc_solutions.map((post) => ({
		slug: post.page_slug.split("/"),
	}));
}

export default function AdventOfCodeSolutionPage({ params: { slug } }: PageParams) {
	const full_slug = slug.join("/");
	const post = aoc_solutions.find((page) => page.page_slug === full_slug);

	if (!post) notFound();

	return (
		<>
			<script
				type="application/ld+json"
				suppressHydrationWarning
				// biome-ignore lint/security/noDangerouslySetInnerHtml: needed
				dangerouslySetInnerHTML={{ __html: JSON.stringify(post.structured_data) }}
			/>
			<ReadingProgress />
			<h1 className="hyphens-manual pt-10 pb-20 font-bold font-serif text-8xl tracking-tighter max-sm:text-7xl">
				<Balancer>
					<span
						className="w-fit bg-gradient-to-r from-primary to-secondary box-decoration-slice bg-clip-text text-transparent"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: neeeded for &shy;
						dangerouslySetInnerHTML={{ __html: post.title }}
					/>
				</Balancer>
			</h1>

			<MDXContent code={post.code} components={{}} />

			<ViewsCounter slug={(post.url as Route) ?? post.page_path} />
		</>
	);
}
