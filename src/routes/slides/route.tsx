import { createFileRoute, Outlet } from "@tanstack/react-router";

import { SITE_TITLE_APPEND } from "@/config";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

export const Route = createFileRoute("/slides")({
	component: MainLayout,
	head: () => ({
		links: [{ rel: "canonical", href: canonicalUrl("/slides") }],
		meta: [
			{ title: `Slides ${SITE_TITLE_APPEND}` },
			{ property: "og:title", content: `Slides ${SITE_TITLE_APPEND}` },
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: canonicalUrl("/slides") },
			{ property: "og:image", content: defaultOgImageUrl() },
			{ name: "twitter:title", content: `Slides ${SITE_TITLE_APPEND}` },
			{ name: "twitter:image", content: defaultOgImageUrl() },
		],
	}),
});

function MainLayout() {
	return (
		<>
			<main id="main-content">
				<Outlet />
			</main>
			<ViewsCounter hidden />
		</>
	);
}
