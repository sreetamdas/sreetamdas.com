import { GetStaticProps } from "next";
import { Fragment } from "react";

import { Newsletter, TNewsletterProps } from "components/blog/Newsletter";
import { DocumentHead } from "components/shared/seo";
import { getButtondownSubscriberCount } from "utils/misc";

const Index = ({ subscriberCount }: TNewsletterProps) => {
	return (
		<Fragment>
			<DocumentHead
				title="Newsletter"
				description="Curated links keeping up with the JavaScript, React and webdev world. And mechanical keyboards!"
			/>
			<Newsletter {...{ subscriberCount }} />
		</Fragment>
	);
};

export default Index;

export const getStaticProps: GetStaticProps = async () => {
	const subscriberCount = await getButtondownSubscriberCount();

	return {
		props: { subscriberCount },
	};
};
