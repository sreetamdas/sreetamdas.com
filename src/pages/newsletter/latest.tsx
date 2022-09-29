import { getLatestButtondownEmailSlug } from "@/domains/Buttondown";

const NewsletterLandingPage = () => <div>DONT SEE THIS</div>;

export default NewsletterLandingPage;

export async function getStaticProps() {
	const latestIssueSlug = await getLatestButtondownEmailSlug();

	return {
		redirect: {
			destination: `/newsletter/${latestIssueSlug}`,
			permanent: false,
		},
	};
}
