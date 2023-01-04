import { bundleMDX } from "mdx-bundler";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";

import { NEWSLETTER_DESCRIPTION } from "@/components/Newsletter";
import { IssueViewProps, NewsletterIssueDetail } from "@/components/Newsletter/Issue";
import { NewsletterSignup } from "@/components/Newsletter/Signup";
import { ViewsCounter } from "@/components/ViewsCounter";
import { DocumentHead } from "@/components/shared/seo";
import {
	getAllButtondownNewsletterEmails,
	getButtondownSubscriberCount,
} from "@/domains/Buttondown";
import { Space } from "@/styles/layouts";

const NewsletterLandingPage = ({
	subscriberCount,
	issue,
}: InferGetStaticPropsType<typeof getStaticProps>) => (
	<>
		<DocumentHead title={issue.subject} description={NEWSLETTER_DESCRIPTION} />

		<Space $size={50} />
		<NewsletterIssueDetail issue={issue} />
		<Space $size={50} />

		<NewsletterSignup {...{ subscriberCount }} />
		<Space $size={50} />
		<ViewsCounter />
	</>
);

export default NewsletterLandingPage;

type PageProps = {
	subscriberCount: number;
} & IssueViewProps;
export const getStaticProps: GetStaticProps<PageProps> = async ({ params }) => {
	const subscriberCount = await getButtondownSubscriberCount();

	if (typeof params?.slug === "undefined" || Array.isArray(params?.slug)) {
		return {
			notFound: true,
		};
	}

	const newsletterIssue = (await getAllButtondownNewsletterEmails()).results.find(
		(issue) => issue.slug === params.slug
	);

	if (typeof newsletterIssue === "undefined") {
		return {
			notFound: true,
		};
	}

	const bodyParsed = await bundleMDX({ source: newsletterIssue.body });

	return {
		props: { subscriberCount, issue: { ...newsletterIssue, bodyParsed } },
	};
};

export const getStaticPaths: GetStaticPaths = async () => {
	const newsletterIssues = await getAllButtondownNewsletterEmails();
	const paths = newsletterIssues.results.map(({ slug }) => ({
		params: { slug },
	}));

	return {
		paths,
		fallback: false,
	};
};
