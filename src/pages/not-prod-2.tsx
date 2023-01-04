import { GetStaticProps } from "next";

import { DocumentHead } from "@/components/shared/seo";
import { LiveViewsCounter } from "@/domains/Workers/LiveViewsCounter";
import { Center } from "@/styles/layouts";
import { Paragraph, Title } from "@/styles/typography";

const Index = () => (
	<>
		<DocumentHead title="Dev" />
		<Center>
			<Title $size={5} $codeFont>
				/dev
			</Title>
			<Paragraph>A non-Prod environment.</Paragraph>
			<LiveViewsCounter />
		</Center>
	</>
);

export const getStaticProps: GetStaticProps = () => {
	const isNotProduction = process.env.NODE_ENV !== "production";

	if (isNotProduction) return { props: {} };
	return { notFound: true };
};

export default Index;
