import { captureMessage } from "@sentry/nextjs";
import { bundleMDX } from "mdx-bundler";
import { notFound } from "next/navigation";

import { NewsletterEmailDetail } from "../components";
import { fetchNewsletterEmails } from "../helpers";

type PageProps = { params: { slug: string } };
export default async function NewsletterEmailDetailPage({ params: { slug } }: PageProps) {
	const newsletterEmailData = await getNewsletterEmailsDataBySlug(slug);

	return <NewsletterEmailDetail email={newsletterEmailData} />;
}

export const generateStaticParams = async () => {
	const newsletterEmailsSlugs = await getNewsletterEmailsSlugs();

	return newsletterEmailsSlugs;
};

async function getNewsletterEmailsSlugs() {
	const buttondownAPIEmailsResponse = await fetchNewsletterEmails();

	return buttondownAPIEmailsResponse.results.map(({ slug }) => ({ slug }));
}

async function getNewsletterEmailsDataBySlug(slug: string) {
	const buttondownAPIEmailsResponse = await fetchNewsletterEmails();
	const newsletterEmailBySlug = buttondownAPIEmailsResponse.results.find(
		(issue) => issue.slug === slug
	);

	if (typeof newsletterEmailBySlug === "undefined") {
		captureMessage(`Newsletter email not found`, "warning");
		notFound();
	}

	const bodyParsed = await bundleMDX({ source: newsletterEmailBySlug.body });
	return { ...newsletterEmailBySlug, bodyParsed };
}
