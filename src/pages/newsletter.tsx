import { InferGetStaticPropsType } from "next";
import { Fragment } from "react";

import { ViewsCounter } from "@/components/ViewsCounter";
import { Newsletter } from "@/components/blog/Newsletter";
import { DocumentHead } from "@/components/shared/seo";
import { Space } from "@/styles/layouts";
import { getButtondownSubscriberCount } from "@/utils/misc";

const Index = ({ subscriberCount }: InferGetStaticPropsType<typeof getStaticProps>) => {
	return (
		<Fragment>
			<DocumentHead
				title="Newsletter"
				description="Curated links keeping up with the JavaScript, React and webdev world. And mechanical keyboards!"
			/>
			<Newsletter {...{ subscriberCount }} />
			<Space size={50} />
			<ViewsCounter />
		</Fragment>
	);
};

export default Index;

export async function getStaticProps() {
	const subscriberCount = await getButtondownSubscriberCount();

	return {
		props: { subscriberCount },
	};
}
