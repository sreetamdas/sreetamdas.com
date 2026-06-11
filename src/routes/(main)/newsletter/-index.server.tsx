import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";

import {
	fetchNewsletterEmails,
	getButtondownApiKey,
	stripButtondownPlaintextMarker,
} from "@/lib/domains/Buttondown";

import { NewsletterEmailsPreviews } from "./-components";

export const getNewsletterEmailsPreviewsRenderable = createServerFn({ method: "GET" })
	.middleware([staticFunctionMiddleware])
	.handler(async () => {
		const apiKey = getButtondownApiKey();
		const newsletter_emails_previews_data = await getNewsletterEmailsPreviewsData(apiKey);
		const Renderable = await renderServerComponent(
			<NewsletterEmailsPreviews emails={newsletter_emails_previews_data} />,
		);

		return { Renderable };
	});

function getEmailPreviewContent(content: string) {
	return (
		stripButtondownPlaintextMarker(content)
			/**
			 * remove salutation, get two paragraphs
			 */
			.replace("Hello there!\n", "")
			.split("\n")
			.slice(0, 3)
			.join("\n")
	);
}
async function getNewsletterEmailsPreviewsData(apiKey?: string) {
	const buttondown_api_emails_response = await fetchNewsletterEmails(apiKey);

	return await Promise.all(
		[...buttondown_api_emails_response.results]
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
