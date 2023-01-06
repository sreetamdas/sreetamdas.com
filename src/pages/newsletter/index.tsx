import { InferGetStaticPropsType } from "next";

import { NewsletterIssues, NEWSLETTER_DESCRIPTION } from "@/components/Newsletter";
import { NewsletterSignup } from "@/components/Newsletter/Signup";
import { ViewsCounter } from "@/components/ViewsCounter";
import { DocumentHead } from "@/components/shared/seo";
import { getAllButtondownEmailsPreviews, getButtondownSubscriberCount } from "@/domains/Buttondown";
import { useSupabaseSession } from "@/domains/Supabase";
import { Center, Space } from "@/styles/layouts";
import { Title } from "@/styles/typography";
import { useHasMounted } from "@/utils/hooks";

const NewsletterLandingPage = ({
	subscriberCount,
	newsletterIssues,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
	const hasMounted = useHasMounted();
	const { isAdminUser } = useSupabaseSession();

	return (
		<>
			<DocumentHead title="Newsletter" description={NEWSLETTER_DESCRIPTION} />
			<Center>
				<Title $size={5} $scaled>
					/newsletter
				</Title>
			</Center>

			<NewsletterSignup subscriberCount={subscriberCount} withNewsletter />

			<Space $size={100} />
			<NewsletterIssues issues={newsletterIssues} isAdminUser={hasMounted && isAdminUser} />
			<Space $size={50} />

			<Space $size={50} />
			<ViewsCounter />
		</>
	);
};

export default NewsletterLandingPage;

export async function getStaticProps() {
	const subscriberCount = await getButtondownSubscriberCount();
	const newsletterIssues = await getAllButtondownEmailsPreviews();

	return {
		props: { subscriberCount, newsletterIssues },
	};
}
