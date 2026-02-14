import { blogPosts } from "@/generated";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { absoluteUrl, canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

import { NotFound404 } from "@/lib/components/Error";
import { MDXContent } from "@/lib/components/MDX";
import { ReadingProgress } from "@/lib/components/ProgressBar.client";
import { InfoBlock } from "@/lib/components/sink";
import { Gradient } from "@/lib/components/Typography";
import { ChameleonHighlight, Sparkles } from "@/lib/components/Typography.client";
import { ViewsCounter } from "@/lib/components/ViewsCounter";

import {
	HighlightWithUseEffect,
	HighlightWithUseInterval,
} from "./-chameleon-text/components.client";
import { isNil } from "lodash-es";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";

type BlogPost = (typeof blogPosts)[number];

const page_slug = z.object({
	slug: z.string().min(1),
});

const getBlogContent = createServerFn({ method: "GET" })
	.inputValidator((data) => page_slug.parse(data))
	.handler(({ data: { slug } }) => {
		const post = blogPosts.find((page) => page.page_slug === slug);

		if (isNil(post)) {
			throw notFound();
		}

		return post;
	});

export const Route = createFileRoute("/(main)/blog/$slug")({
	component: RouteComponent,
	head: ({ loaderData }: { loaderData?: BlogPost }) => {
		const post = loaderData;
		const title = `${post?.seo_title ?? post?.title ?? "Blog"} ${SITE_TITLE_APPEND}`;
		const description = post?.description ?? SITE_DESCRIPTION;
		const canonical = canonicalUrl(post?.page_path ?? "/blog");
		const ogImage = post?.image ? absoluteUrl(post.image) : defaultOgImageUrl();

		return {
			links: [{ rel: "canonical", href: canonical }],
			meta: [
				{ title },
				{ name: "description", content: description },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:type", content: "article" },
				{ property: "og:url", content: canonical },
				{ property: "og:image", content: ogImage },
				{ name: "twitter:title", content: title },
				{ name: "twitter:description", content: description },
				{ name: "twitter:image", content: ogImage },
			],
		};
	},

	loader: ({ params }: { params: { slug: string } }) => {
		return getBlogContent({ data: { slug: params.slug } });
	},
	notFoundComponent: () => (
		<NotFound404 message="The blog post you're looking for doesn't exist :/" />
	),
});

function RouteComponent() {
	const post = Route.useLoaderData();

	return (
		<>
			<ReadingProgress />
			<h1 className="pt-10 font-serif text-8xl font-bold tracking-tighter">
				<Gradient>{post.title}</Gradient>
			</h1>
			<p className="text-foreground/60 pb-20 text-sm">
				{new Date(post.published_at).toLocaleDateString("en-US", {
					year: "numeric",
					month: "long",
					day: "numeric",
				})}
				{post.reading_time ? ` · ${post.reading_time} min read` : null}
			</p>

			<MDXContent
				source={post.raw}
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

			<ViewsCounter />
		</>
	);
}
