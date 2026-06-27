import { createFileRoute } from "@tanstack/react-router";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

import { ShowcasePage } from "./-components";
import { getShowcaseRsc } from "./-rsc.server";
import { validateShowcaseSearch } from "./-shared";
import { getShowcaseSnapshot } from "./-showcase.server";
import { getStreamingShowcaseData } from "./-streaming.server";

export const Route = createFileRoute("/slides/tanstack-start/showcase")({
	component: RouteComponent,
	validateSearch: validateShowcaseSearch,
	loaderDeps: ({ search }) => ({ feature: search.feature }),
	loader: async ({ deps }) => ({
		snapshot: await getShowcaseSnapshot({ data: deps }),
		// Not awaited: streams into the shell when it resolves (PPR-style).
		streamed: getStreamingShowcaseData(),
		rsc: await getShowcaseRsc(),
	}),
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
	const { snapshot, streamed, rsc } = Route.useLoaderData();

	return (
		<ShowcasePage
			activeFeature={search.feature}
			initialSnapshot={snapshot}
			streamedData={streamed}
			serverComponent={rsc.Renderable}
			serverComponentRenderedAt={rsc.renderedAtIso}
		/>
	);
}
