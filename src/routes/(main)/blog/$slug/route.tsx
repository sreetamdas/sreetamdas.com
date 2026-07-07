import { createFileRoute } from "@tanstack/react-router";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { NotFound404 } from "@/lib/components/Error";
import { ReadingProgress } from "@/lib/components/ProgressBar";
import { Gradient } from "@/lib/components/Typography";
import { StatsCounter } from "@/lib/domains/PageInteraction/StatsCounter";
import { cn } from "@/lib/helpers/utils";
import { absoluteUrl, canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

import { getBlogRenderable } from "./-$slug.server";

export const Route = createFileRoute("/(main)/blog/$slug")({
	component: RouteComponent,
	headers: () => ({
		"cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
	}),
	staleTime: 1000 * 60 * 60 * 24,
	loader: ({ params }: { params: { slug: string } }) => {
		return getBlogRenderable({ data: { slug: params.slug } });
	},
	head: ({ loaderData }) => {
		const post = loaderData?.post;
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
	notFoundComponent: () => (
		<NotFound404 message="The blog post you're looking for doesn't exist :/" />
	),
});

function RouteComponent() {
	const { post, Renderable } = Route.useLoaderData();
	const shouldUseCompactTitle = post.page_slug === "chameleon-text";

	return (
		<>
			<ReadingProgress />
			<h1
				className={cn(
					"pt-10 font-serif text-8xl font-bold",
					shouldUseCompactTitle &&
						"max-sm:text-[clamp(3rem,14vw,6rem)] max-sm:leading-[0.95] max-sm:text-balance max-sm:wrap-break-word",
				)}
			>
				<Gradient>{post.title}</Gradient>
			</h1>
			<p className="pb-20 text-sm text-foreground/60">
				{new Date(post.published_at).toLocaleDateString("en-US", {
					year: "numeric",
					month: "long",
					day: "numeric",
				})}
				{post.reading_time ? ` · ${post.reading_time} min read` : null}
			</p>

			{Renderable}

			<StatsCounter variant="engagement" page_type="post" />
		</>
	);
}
