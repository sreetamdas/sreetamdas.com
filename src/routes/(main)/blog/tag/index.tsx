import { createFileRoute } from "@tanstack/react-router";

import { SITE_TITLE_APPEND } from "@/config";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

import { getBlogTagsRenderable } from "./-index.server";

export const Route = createFileRoute("/(main)/blog/tag/")({
	component: BlogTagsPage,
	staleTime: 1000 * 60 * 60 * 24,
	loader: () => getBlogTagsRenderable(),
	head: () => {
		const title = `Blog tags ${SITE_TITLE_APPEND}`;
		const description = "Browse every tag used across the blog archive.";
		const canonical = canonicalUrl("/blog/tag");
		const ogImage = defaultOgImageUrl();

		return {
			links: [{ rel: "canonical", href: canonical }],
			meta: [
				{ title },
				{ name: "description", content: description },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: canonical },
				{ property: "og:image", content: ogImage },
				{ name: "twitter:title", content: title },
				{ name: "twitter:description", content: description },
				{ name: "twitter:image", content: ogImage },
			],
		};
	},
});

function BlogTagsPage() {
	const { Renderable } = Route.useLoaderData();

	return (
		<>
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold max-sm:text-5xl">/blog/tag</h1>
			{Renderable}
		</>
	);
}
