import { createFileRoute } from "@tanstack/react-router";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { FoobarEntry } from "@/lib/domains/foobar/Entry";
import { StatsCounter } from "@/lib/domains/PageInteraction/StatsCounter";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

import { getAboutRenderable } from "./-about.server";

export const Route = createFileRoute("/(main)/about")({
	component: AboutPage,
	loader: () => {
		return getAboutRenderable();
	},
	head: ({ loaderData }) => {
		const title = `About ${SITE_TITLE_APPEND}`;
		const description = loaderData?.post?.description ?? SITE_DESCRIPTION;
		const canonical = canonicalUrl("/about");
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
	staleTime: 1000 * 60 * 60 * 24,
});

function AboutPage() {
	const { Renderable } = Route.useLoaderData();

	return (
		<>
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold">/about</h1>
			{Renderable}
			<StatsCounter />
			<FoobarEntry />
		</>
	);
}
