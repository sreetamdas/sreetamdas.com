import { createFileRoute } from "@tanstack/react-router";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { StatsCounter } from "@/lib/domains/PageInteraction/StatsCounter";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

import { getRootPageRenderable } from "./-$slug.server";

export const Route = createFileRoute("/(main)/$slug")({
	component: MDXPageSlugPage,
	headers: () => ({
		"cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
	}),
	staleTime: 1000 * 60 * 60 * 24,
	loader: ({ params }: { params: { slug: string } }) => {
		return getRootPageRenderable({ data: { slug: params.slug } });
	},
	head: ({ loaderData }) => {
		const post = loaderData?.post;
		const titleBase = post?.title ?? post?.page_slug ?? "Page";
		const title = `${titleBase} ${SITE_TITLE_APPEND}`;
		const description = post?.description ?? SITE_DESCRIPTION;
		const canonical = canonicalUrl(post?.page_path ?? "/");
		const ogImage = defaultOgImageUrl();

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
});

function MDXPageSlugPage() {
	const { post, Renderable } = Route.useLoaderData();

	return (
		<>
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold">/{post.page_slug}</h1>
			{Renderable}
			<StatsCounter />
		</>
	);
}
