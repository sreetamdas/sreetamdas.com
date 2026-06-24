import { createFileRoute } from "@tanstack/react-router";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

import { ShowcasePage } from "./-components";
import { validateShowcaseSearch } from "./-shared";
import { getShowcaseSnapshot } from "./-showcase.server";

export const Route = createFileRoute("/slides/tanstack-start/showcase")({
	component: RouteComponent,
	validateSearch: validateShowcaseSearch,
	loaderDeps: ({ search }) => ({ feature: search.feature }),
	loader: ({ deps }) => getShowcaseSnapshot({ data: deps }),
	staleTime: 1000 * 30,
	head: () => {
		const title = `TanStack Start showcase ${SITE_TITLE_APPEND}`;
		const description = `Concrete TanStack Start demos from ${SITE_DESCRIPTION}`;
		const canonical = canonicalUrl("/slides/tanstack-start/showcase");
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

function RouteComponent() {
	const search = Route.useSearch();
	const snapshot = Route.useLoaderData();

	return <ShowcasePage activeFeature={search.feature} initialSnapshot={snapshot} />;
}
