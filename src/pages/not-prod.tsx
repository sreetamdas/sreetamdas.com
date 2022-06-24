import { GetStaticProps } from "next";

import { Button } from "@/components/Button";
import { DocumentHead } from "@/components/shared/seo";
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
			<Button
				onClick={() => {
					throw new Error("Sentry Frontend Error");
				}}
			>
				Throw error
			</Button>
		</Center>
	</>
);

export const getStaticProps: GetStaticProps = () => {
	const isNotProduction = process.env.NODE_ENV !== "production";

	if (isNotProduction) return { props: {} };
	return { notFound: true };
};

export default Index;
