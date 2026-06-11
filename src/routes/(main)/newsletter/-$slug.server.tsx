import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";

import {
	fetchNewsletterEmails,
	getButtondownApiKey,
	stripButtondownPlaintextMarker,
} from "@/lib/domains/Buttondown";

import { NewsletterEmailDetail } from "./-components";

export type NewsletterIssue = Awaited<ReturnType<typeof fetchNewsletterEmails>>["results"][number];
export type NewsletterLoaderData = {
	newsletter_email_data: NewsletterIssue & {
		body: string;
	};
};

export const getNewsletterEmailRenderable = createServerFn({
	method: "GET",
})
	.middleware([staticFunctionMiddleware])
	.validator((data) => {
		if (typeof data !== "object" || data === null || !("slug" in data)) {
			throw new Error("Invalid newsletter slug payload");
		}

		if (typeof data.slug !== "string") {
			throw new Error("Invalid newsletter slug payload");
		}

		return { slug: data.slug };
	})
	.handler(async ({ data }) => {
		const { slug } = data;
		const apiKey = getButtondownApiKey();
		const buttondown_api_emails_response = await fetchNewsletterEmails(apiKey);
		const newsletter_email_by_slug = buttondown_api_emails_response.results.find(
			(issue) => issue.slug === slug,
		);

		if (typeof newsletter_email_by_slug === "undefined") {
			throw notFound();
		}

		const trimmed_email_body = stripButtondownPlaintextMarker(newsletter_email_by_slug.body);

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
