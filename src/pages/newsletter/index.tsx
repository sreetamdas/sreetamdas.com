import { useSessionContext } from "@supabase/auth-helpers-react";
import { InferGetStaticPropsType } from "next";

import { NewsletterIssues } from "@/components/Newsletter";
import { NewsletterSignup } from "@/components/Newsletter/Signup";
import { ViewsCounter } from "@/components/ViewsCounter";
import { DocumentHead } from "@/components/shared/seo";
import { NEWSLETTER_DESCRIPTION, OWNER } from "@/config";
import { getAllButtondownEmailsPreviews, getButtondownSubscriberCount } from "@/domains/Buttondown";
import { Center, Space } from "@/styles/layouts";
import { Title } from "@/styles/typography";
import { useHasMounted } from "@/utils/hooks";

const NewsletterLandingPage = ({
	subscriberCount,
	newsletterIssues,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
	const hasMounted = useHasMounted();
	const { session } = useSessionContext();

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
			<NewsletterIssues
				issues={newsletterIssues}
				isAdminUser={hasMounted && session?.user?.email === OWNER}
			/>
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
