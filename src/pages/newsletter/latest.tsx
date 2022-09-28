import { GetStaticPropsResult } from "next";

import { getLatestButtondownEmailSlug } from "@/domains/Buttondown";

const NewsletterLandingPage = () => <div>DONT SEE THIS</div>;

export default NewsletterLandingPage;

export async function getStaticProps(): Promise<GetStaticPropsResult<never>> {
	const latestIssueSlug = await getLatestButtondownEmailSlug();

	return {
		redirect: {
			destination: `/newsletter/${latestIssueSlug}`,
			statusCode: 302,
		},
	};
}
