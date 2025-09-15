import { blogPosts } from "@/generated";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { Balancer } from "react-wrap-balancer";
import { MDXContent } from "@/lib/components/MDX";
import { ReadingProgress } from "@/lib/components/ProgressBar.client";
import { InfoBlock } from "@/lib/components/sink";
import { Gradient } from "@/lib/components/Typography";
import { ChameleonHighlight, Sparkles } from "@/lib/components/Typography.client";
import { ViewsCounter } from "@/lib/components/ViewsCounter";

import {
	HighlightWithUseEffect,
	HighlightWithUseInterval,
} from "./chameleon-text/components.client";
import { isNil } from "lodash-es";

export const Route = createFileRoute("/(main)/blog/$slug")({
	component: RouteComponent,
	loader: ({ params: { slug } }) => {
		console.log({ slug });
		const post = blogPosts.find((page) => page.page_slug === slug);

		if (isNil(post)) {
			throw notFound();
		}

		return post;
	},
	notFoundComponent: () => (
		<>
			<h1 className="pt-10 text-center font-serif text-[160px] font-bold tracking-tighter">
				<Gradient>404!</Gradient>
			</h1>
			<p className="pt-4 text-center font-serif text-xl">
				The blog post you&apos;re trying to find doesn&apos;t exist :/
			</p>
		</>
	),
});

function RouteComponent() {
	const post = Route.useLoaderData();

	return (
		<>
			<ReadingProgress />
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold tracking-tighter">
				<Balancer>
					<Gradient>{post.title}</Gradient>
				</Balancer>
			</h1>

			<MDXContent
				code={post.code}
				components={{
					ChameleonHighlight,
					Gradient,
					InfoBlock,
					Sparkles,

					// Post specific components
					HighlightWithUseEffect,
					HighlightWithUseInterval,
				}}
			/>
		</>
	);
}
