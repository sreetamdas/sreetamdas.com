import { createFileRoute } from "@tanstack/react-router";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { StatsCounter } from "@/lib/domains/PageInteraction/StatsCounter";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

import { getHomeRenderable } from "./-index.server";

export const Route = createFileRoute("/(main)/")({
	component: Home,
	staleTime: 1000 * 60 * 60 * 24,
	loader: () => {
		return getHomeRenderable();
	},
	head: () => {
		const title = `Hello hello! ${SITE_TITLE_APPEND}`;
		const description = SITE_DESCRIPTION;
		const canonical = canonicalUrl("/");
		const ogImage = defaultOgImageUrl();

		return {
			links: [{ rel: "canonical", href: canonical }],
			meta: [
				{ title },
				{ name: "description", content: description },
				{ property: "og:title", content: `👋 Hello hello! ${SITE_TITLE_APPEND}` },
				{ property: "og:description", content: description },
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: canonical },
				{ property: "og:image", content: ogImage },
				{ name: "twitter:title", content: `👋 Hello hello! ${SITE_TITLE_APPEND}` },
				{ name: "twitter:description", content: description },
				{ name: "twitter:image", content: ogImage },
			],
		};
	},
});

function Home() {
	const { Renderable } = Route.useLoaderData();
	return (
		<>
			<h1 className="py-20 text-center font-serif text-6xl font-bold">
				Hey, I&apos;m Sreetam! <span aria-hidden="true">👋</span>
			</h1>
			{Renderable}

			<StatsCounter hidden />
		</>
	);
}
