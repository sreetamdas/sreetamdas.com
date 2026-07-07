import { createFileRoute } from "@tanstack/react-router";

import { SITE_TITLE_APPEND } from "@/config";
import { StatsCounter } from "@/lib/domains/PageInteraction/StatsCounter";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";
import { STATIC_SERVER_FUNCTION_STALE_TIME } from "@/lib/static-server-functions";

import { getKeebsRenderable } from "./-keebs.server";

export const Route = createFileRoute("/(main)/keebs")({
	component: KeebsPage,
	headers: () => ({
		"cache-control": "public, max-age=0, stale-while-revalidate=3600",
	}),
	staleTime: STATIC_SERVER_FUNCTION_STALE_TIME,
	loader: () => getKeebsRenderable(),
	head: () => ({
		links: [{ rel: "canonical", href: canonicalUrl("/keebs") }],
		meta: (() => {
			const title = `Keebs ${SITE_TITLE_APPEND}`;
			const description = "A collection of my mechanical keyboards";
			const canonical = canonicalUrl("/keebs");
			const ogImage = defaultOgImageUrl();

			return [
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
			];
		})(),
	}),
});

function KeebsPage() {
	const { Renderable } = Route.useLoaderData();

	return (
		<>
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold">/keebs</h1>
			{Renderable}
			<StatsCounter />
		</>
	);
}
