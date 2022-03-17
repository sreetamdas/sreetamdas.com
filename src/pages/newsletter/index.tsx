import { InferGetStaticPropsType } from "next";

import { NewsletterIssues } from "@/components/Newsletter";
import { NewsletterSignup } from "@/components/Newsletter/Signup";
import { ViewsCounter } from "@/components/ViewsCounter";
import { DocumentHead } from "@/components/shared/seo";
import { NEWSLETTER_DESCRIPTION } from "@/config";
import { getAllButtondownEmailsPreviews, getButtondownSubscriberCount } from "@/domains/Buttondown";
import { Center, Space } from "@/styles/layouts";
import { Title } from "@/styles/typography";

const NewsletterLandingPage = ({
	subscriberCount,
	newsletterIssues,
}: InferGetStaticPropsType<typeof getStaticProps>) => (
	<>
		<DocumentHead title="Newsletter" description={NEWSLETTER_DESCRIPTION} />
		<Center>
			<Title $size={5} $scaled>
				/newsletter
			</Title>
		</Center>

		<NewsletterSignup subscriberCount={subscriberCount} withNewsletter />

		<Space size={100} />
		<NewsletterIssues issues={newsletterIssues} />
		<Space size={50} />

		<Space size={50} />
		<ViewsCounter />
	</>
);

export default NewsletterLandingPage;

export async function getStaticProps() {
	const subscriberCount = await getButtondownSubscriberCount();
	const newsletterIssues = await getAllButtondownEmailsPreviews();

	return {
		props: { subscriberCount, newsletterIssues },
	};
}
