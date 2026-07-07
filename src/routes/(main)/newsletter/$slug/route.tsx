import { createFileRoute } from "@tanstack/react-router";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { canonicalUrl, defaultOgImageUrl, excerptFromMarkdown } from "@/lib/seo";
import { STATIC_SERVER_FUNCTION_STALE_TIME } from "@/lib/static-server-functions";

import { getNewsletterEmailRenderable } from "./-$slug.server";

export const Route = createFileRoute("/(main)/newsletter/$slug")({
	component: NewsletterEmailDetailPage,
	headers: () => ({
		"cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
	}),
	staleTime: STATIC_SERVER_FUNCTION_STALE_TIME,
	loader: async ({ params: { slug } }) => {
		return getNewsletterEmailRenderable({ data: { slug } });
	},
	head: ({ loaderData }) => {
		const email = loaderData?.newsletter_email_data;
		const title = `${email?.subject ?? "Newsletter"} ${SITE_TITLE_APPEND}`;
		const description = excerptFromMarkdown(email?.body ?? "") || SITE_DESCRIPTION;
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
				...(email?.publish_date
					? [{ property: "article:published_time", content: email.publish_date }]
					: []),
				{ name: "twitter:title", content: title },
				{ name: "twitter:description", content: description },
				{ name: "twitter:image", content: ogImage },
			],
		};
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
