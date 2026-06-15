import { createFileRoute } from "@tanstack/react-router";

import { SITE_TITLE_APPEND } from "@/config";
import { StatsCounter } from "@/lib/domains/PageInteraction/StatsCounter";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";
import { STATIC_SERVER_FUNCTION_STALE_TIME } from "@/lib/static-server-functions";

import { getNewsletterEmailsPreviewsRenderable } from "./-index.server";

export const Route = createFileRoute("/(main)/newsletter/")({
	component: NewsletterEmailsPage,
	staleTime: STATIC_SERVER_FUNCTION_STALE_TIME,
	loader: async () => {
		return getNewsletterEmailsPreviewsRenderable();
	},
	head: () => ({
		links: [{ rel: "canonical", href: canonicalUrl("/newsletter") }],
		meta: [
			{
				title: `Newsletter ${SITE_TITLE_APPEND}`,
			},
			{
				name: "description",
				content:
					"Curated links keeping up with the JavaScript, React and webdev world. And mechanical keyboards!",
			},
			{ property: "og:title", content: `Newsletter ${SITE_TITLE_APPEND}` },
			{
				property: "og:description",
				content:
					"Curated links keeping up with the JavaScript, React and webdev world. And mechanical keyboards!",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: canonicalUrl("/newsletter") },
			{ property: "og:image", content: defaultOgImageUrl() },
			{ name: "twitter:title", content: `Newsletter ${SITE_TITLE_APPEND}` },
			{
				name: "twitter:description",
				content:
					"Curated links keeping up with the JavaScript, React and webdev world. And mechanical keyboards!",
			},
			{ name: "twitter:image", content: defaultOgImageUrl() },
		],
	}),
});

function NewsletterEmailsPage() {
	const { Renderable } = Route.useLoaderData();

	return (
		<>
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold">/newsletter</h1>
			{Renderable}
			<StatsCounter />
		</>
	);
}
