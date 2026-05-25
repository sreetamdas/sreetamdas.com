import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

import { NewsletterEmailDetail } from "./-components";
import { fetchNewsletterEmails, getButtondownApiKey } from "./-helpers";

type NewsletterIssue = Awaited<ReturnType<typeof fetchNewsletterEmails>>["results"][number];
type NewsletterLoaderData = {
	newsletter_email_data: NewsletterIssue & {
		body: string;
	};
};

export const Route = createFileRoute("/(main)/newsletter/$slug")({
	component: NewsletterEmailDetailPage,
	staleTime: 1000 * 60 * 10,
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

const getNewsletterEmailRenderable = createServerFn({
	method: "GET",
})
	.inputValidator((data) => {
		if (typeof data !== "object" || data === null || !("slug" in data)) {
			throw new Error("Invalid newsletter slug payload");
		}

		if (typeof data.slug !== "string") {
			throw new Error("Invalid newsletter slug payload");
		}

		return { slug: data.slug };
	})
	.handler(async ({ data, context }) => {
		const { slug } = data;
		const apiKey = getButtondownApiKey(context.env);
		const buttondown_api_emails_response = await fetchNewsletterEmails(apiKey);
		const newsletter_email_by_slug = buttondown_api_emails_response.results.find(
			(issue) => issue.slug === slug,
		);

		if (typeof newsletter_email_by_slug === "undefined") {
			throw notFound();
		}

		/**
		 * Buttondown now includes a `<!-- buttondown-editor-mode: plaintext -->` at the start of the
		 * email body, that is cannot be processed by micromark
		 */
		const trimmed_email_body = newsletter_email_by_slug.body.replace(
			"<!-- buttondown-editor-mode: plaintext -->",
			"",
		);

		const newsletter_email_data: typeof newsletter_email_by_slug & {
			body: string;
		} = {
			...newsletter_email_by_slug,
			body: trimmed_email_body,
		};

		const Renderable = await renderServerComponent(
			<NewsletterEmailDetail email={newsletter_email_data} />,
		);

		return { newsletter_email_data, Renderable };
	});

function NewsletterEmailDetailPage() {
	const { Renderable } = Route.useLoaderData();

	return <>{Renderable}</>;
}
