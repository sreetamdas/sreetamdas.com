import { NewsletterEmailDetail } from "./-components";
import { fetchNewsletterEmails } from "./-helpers";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

export const dynamicParams = false;

// export async function generateStaticParams() {
// 	const newsletter_emails_slugs = await getNewsletterEmailsSlugs();

// 	return newsletter_emails_slugs;
// }

// export async function generateMetadata(props: PageProps): Promise<Metadata> {
// 	const params = await props.params;

// 	const { slug } = params;

// 	const newsletter_email_data = await getNewsletterEmailsDataBySlug(slug);

// 	return {
// 		title: newsletter_email_data.subject,
// 	};
// }

export const Route = createFileRoute("/(main)/newsletter/$slug")({
	component: NewsletterEmailDetailPage,
	head: (ctx: any) => {
		const email = ctx.loaderData?.newsletter_email_data;
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
		const buttondown_api_emails_response = await fetchNewsletterEmails();
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
		return { newsletter_email_data };
	},
	notFoundComponent: () => (
		<>
			<h1>Not Found</h1>
			<p>The newsletter issue/email you&apos;re trying to find doesn&apos;t exist :/</p>
		</>
	),
});

function NewsletterEmailDetailPage() {
	const { newsletter_email_data } = Route.useLoaderData() as any;

	return <NewsletterEmailDetail email={newsletter_email_data} />;
}

// async function getNewsletterEmailsSlugs() {
// 	const buttondown_api_emails_response = await fetchNewsletterEmails();

// 	return buttondown_api_emails_response.results.map(({ slug }) => ({ slug }));
// }
