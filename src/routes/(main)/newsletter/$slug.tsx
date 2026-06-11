import { createFileRoute } from "@tanstack/react-router";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";
import { STATIC_SERVER_FUNCTION_STALE_TIME } from "@/lib/static-server-functions";

import { getNewsletterEmailRenderable, type NewsletterLoaderData } from "./-$slug.server";

export const Route = createFileRoute("/(main)/newsletter/$slug")({
	component: NewsletterEmailDetailPage,
	staleTime: STATIC_SERVER_FUNCTION_STALE_TIME,
	head: ({ loaderData }: { loaderData?: NewsletterLoaderData }) => {
		const email = loaderData?.newsletter_email_data;
		const title = `${email?.subject ?? "Newsletter"} ${SITE_TITLE_APPEND}`;
		const description = SITE_DESCRIPTION;
		const canonical = canonicalUrl(`/newsletter/${email?.slug ?? ""}`);
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
	loader: async ({ params: { slug } }) => {
		return getNewsletterEmailRenderable({ data: { slug } });
	},
	notFoundComponent: () => (
		<>
			<h1>Not Found</h1>
			<p>The newsletter issue/email you&apos;re trying to find doesn&apos;t exist :/</p>
		</>
	),
});

function NewsletterEmailDetailPage() {
	const { Renderable } = Route.useLoaderData();

	return <>{Renderable}</>;
}
