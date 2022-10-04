import type { Session } from "@supabase/supabase-js";
import { InferGetStaticPropsType } from "next";
import { useState, useEffect } from "react";

import { NewsletterIssues } from "@/components/Newsletter";
import { NewsletterSignup } from "@/components/Newsletter/Signup";
import { ViewsCounter } from "@/components/ViewsCounter";
import { DocumentHead } from "@/components/shared/seo";
import { NEWSLETTER_DESCRIPTION, OWNER } from "@/config";
import { getAllButtondownEmailsPreviews, getButtondownSubscriberCount } from "@/domains/Buttondown";
import { SupabaseClient } from "@/domains/Supabase";
import { Center, Space } from "@/styles/layouts";
import { Title } from "@/styles/typography";
import { useHasMounted } from "@/utils/hooks";

const NewsletterLandingPage = ({
	subscriberCount,
	newsletterIssues,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
	const hasMounted = useHasMounted();
	const [session, setSession] = useState<Session | null>(SupabaseClient.auth.session());

	useEffect(() => {
		setSession(SupabaseClient.auth.session());

		SupabaseClient.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});
	}, []);

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
