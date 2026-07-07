import { createFileRoute } from "@tanstack/react-router";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

import { getBlogArchiveRenderable } from "./-index.server";

export const Route = createFileRoute("/(main)/blog/")({
	component: BlogArchivePage,
	headers: () => ({
		"cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
	}),
	staleTime: 1000 * 60 * 60 * 24,
	loader: () => getBlogArchiveRenderable(),
	head: () => {
		const title = `Blog archive ${SITE_TITLE_APPEND}`;
		const description = SITE_DESCRIPTION;
		const canonical = canonicalUrl("/blog");
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

function BlogArchivePage() {
	const { Renderable } = Route.useLoaderData();

	return (
		<>
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold">/blog</h1>
			{Renderable}
		</>
	);
}
