import { captureMessage } from "@sentry/nextjs";
import { bundleMDX } from "mdx-bundler";
import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { NewsletterEmailDetail } from "../components";
import { fetchNewsletterEmails } from "../helpers";

export const runtime = "edge";

export async function generateStaticParams() {
	const newsletter_emails_slugs = await getNewsletterEmailsSlugs();

	return newsletter_emails_slugs;
}

export async function generateMetadata({ params: { slug } }: PageProps): Promise<Metadata> {
	const newsletter_email_data = await getNewsletterEmailsDataBySlug(slug);

	return {
		title: newsletter_email_data.subject,
	};
}

type PageProps = { params: { slug: string } };
export default async function NewsletterEmailDetailPage({ params: { slug } }: PageProps) {
	const newsletter_email_data = await getNewsletterEmailsDataBySlug(slug);

	return <NewsletterEmailDetail email={newsletter_email_data} />;
}

async function getNewsletterEmailsSlugs() {
	const buttondown_api_emails_response = await fetchNewsletterEmails();

	return buttondown_api_emails_response.results.map(({ slug }) => ({ slug }));
}

async function getNewsletterEmailsDataBySlug(slug: string) {
	const buttondown_api_emails_response = await fetchNewsletterEmails();
	const newsletter_email_by_slug = buttondown_api_emails_response.results.find(
		(issue) => issue.slug === slug,
	);

	if (typeof newsletter_email_by_slug === "undefined") {
		captureMessage(`Newsletter email not found`, "warning");
		notFound();
	}

	const bodyParsed = await bundleMDX({ source: newsletter_email_by_slug.body });
	return { ...newsletter_email_by_slug, bodyParsed };
}
