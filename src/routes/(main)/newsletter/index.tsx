import { SITE_TITLE_APPEND } from "@/config";
import { ViewsCounter } from "@/lib/components/ViewsCounter";

import { NewsletterEmailsPreviews } from "./-components";
import { fetchNewsletterEmails } from "./-helpers";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(main)/newsletter/")({
	component: NewsletterEmailsPage,
	loader: async () => {
		const newsletter_emails_previews_data = await getNewsletterEmailsPreviewsData();
		return { newsletter_emails_previews_data };
	},
	head: () => ({
		meta: [
			{
				title: `Newsletter ${SITE_TITLE_APPEND}`,
			},
			{
				name: "description",
				content:
					"Curated links keeping up with the JavaScript, React and webdev world. And mechanical keyboards!",
			},
		],
	}),
});

function NewsletterEmailsPage() {
	const { newsletter_emails_previews_data } = Route.useLoaderData();

	return (
		<>
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold tracking-tighter">/newsletter</h1>
			<NewsletterEmailsPreviews emails={newsletter_emails_previews_data} />
			<ViewsCounter />
		</>
	);
}

function getEmailPreviewContent(content: string) {
	return (
		content
			/**
			 * Buttondown now includes a `<!-- buttondown-editor-mode: plaintext -->` at the start of the
			 * email body, that is cannot be processed by micromark
			 */
			.replace("<!-- buttondown-editor-mode: plaintext -->", "")
			/**
			 * remove salutation, get two paragraphs
			 */
			.replace("Hello there!\n", "")
			.split("\n")
			.slice(0, 3)
			.join("\n")
	);
}
async function getNewsletterEmailsPreviewsData() {
	const buttondown_api_emails_response = await fetchNewsletterEmails();

	return await Promise.all(
		buttondown_api_emails_response.results
			.reverse()
			.map(async ({ body, subject, publish_date, id, secondary_id, slug }) => ({
				slug,
				subject,
				publish_date,
				id,
				secondary_id,
				body: getEmailPreviewContent(body),
			})),
	);
}
