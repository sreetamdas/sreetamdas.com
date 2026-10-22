import { createFileRoute } from "@tanstack/react-router";

import { SITE_TITLE_APPEND } from "@/config";
import { LinkTo } from "@/lib/components/Anchor";
import { NotFound404 } from "@/lib/components/Error";
import { ReadingProgress } from "@/lib/components/ProgressBar";
import { Gradient } from "@/lib/components/Typography";
import { FoobarNotFoundAward } from "@/lib/domains/foobar/Pixel";
import { StatsCounter } from "@/lib/domains/PageInteraction/StatsCounter";
import { cn } from "@/lib/helpers/utils";
import { absoluteUrl, canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

import { getBlogRenderable } from "./-$slug.server";

export const Route = createFileRoute("/(main)/blog/$slug")({
	component: RouteComponent,
	staleTime: 1000 * 60 * 60 * 24,
	loader: ({ params }: { params: { slug: string } }) => {
		return getBlogRenderable({ data: { slug: params.slug } });
	},
	head: ({ loaderData }) => {
		const post = loaderData?.post;
		if (!post) {
			return { meta: [{ title: `Page not found ${SITE_TITLE_APPEND}` }] };
		}

		const title = `${post.seo_title ?? post.title} ${SITE_TITLE_APPEND}`;
		const description = post.description;
		const canonical = canonicalUrl(post.page_path);
		const ogImage = post.image ? absoluteUrl(post.image) : defaultOgImageUrl();

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
		<>
			<NotFound404 message="The blog post you're looking for doesn't exist :/" />
			<FoobarNotFoundAward />
		</>
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
			{post.tagSlugs.length > 0 ? (
				<ul className="flex flex-wrap gap-2 pb-4">
					{post.tagSlugs.map((tagSlug, index) => (
						<li key={tagSlug}>
							<LinkTo
								href={`/blog/tag/${tagSlug}`}
								replaceClasses
								className="inline-flex items-center rounded-global border border-solid border-foreground/15 px-2 py-0.5 text-sm text-foreground/70 transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-dashed"
							>
								{post.tags[index]}
							</LinkTo>
						</li>
					))}
				</ul>
			) : null}
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
