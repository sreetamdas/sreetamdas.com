import { blogPosts } from "@/generated";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { absoluteUrl, canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

import { NotFound404 } from "@/lib/components/Error";
import { MDXContent } from "@/lib/components/MDX";
import { ReadingProgress } from "@/lib/components/ProgressBar";
import { InfoBlock } from "@/lib/components/sink";
import { Gradient } from "@/lib/components/Typography";
import { ChameleonHighlight, Sparkles } from "@/lib/components/TypographyClient";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";

import {
	HighlightWithUseEffect,
	HighlightWithUseInterval,
} from "./-chameleon-text/componentsClient";
import { isNil } from "lodash-es";

type BlogPost = (typeof blogPosts)[number];
async function getBlogContent(slug: string): Promise<BlogPost> {
	const post = blogPosts.find((page) => page.page_slug === slug);

	if (isNil(post)) {
		throw notFound();
	}

	return post;
}

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
		return getBlogRenderable({ data: { slug: params.slug } });
	},
	notFoundComponent: () => (
		<NotFound404 message="The blog post you're looking for doesn't exist :/" />
	),
});

const getBlogRenderable = createServerFn({ method: "GET" })
	.inputValidator((data) => {
		if (
			typeof data !== "object" ||
			data === null ||
			typeof (data as { slug?: unknown }).slug !== "string"
		) {
			throw new Error("Invalid blog slug payload");
		}

		return { slug: (data as { slug: string }).slug };
	})
	.handler(async ({ data }) => {
		const post = await getBlogContent(data.slug);
		const Renderable = await renderServerComponent(
			<MDXContent
				source={post.raw}
				mdast={post.mdast}
				shikiHighlights={post.shikiHighlights}
				components={{
					ChameleonHighlight,
					Gradient,
					InfoBlock,
					Sparkles,

					HighlightWithUseEffect,
					HighlightWithUseInterval,
				}}
			/>,
		);

		return { post, Renderable };
	});

function RouteComponent() {
	const { post, Renderable } = Route.useLoaderData();

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

			{Renderable}

			<ViewsCounter />
		</>
	);
}
