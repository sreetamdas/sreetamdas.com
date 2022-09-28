import { GetStaticPropsResult } from "next";

import { getLatestButtondownEmailSlug } from "@/domains/Buttondown";

const NewsletterLandingPage = () => <div>DONT SEE THIS</div>;

export default NewsletterLandingPage;

export async function getStaticProps(): Promise<GetStaticPropsResult<Record<string, never>>> {
	const latestIssueSlug = await getLatestButtondownEmailSlug();
	const content = null;

	if (!content) {
		return {
			redirect: {
				destination: `/newsletter/${latestIssueSlug}`,
				permanent: false,
			},
		};
	}

	return {
		props: {},
	};
}
