import type { InferGetStaticPropsType } from "next";

import { Keebs } from "@/components/Keebs";
import { getKeebsFromNotion } from "@/components/Keebs/notion";
import { ViewsCounter } from "@/components/ViewsCounter";
import { DocumentHead } from "@/components/shared/seo";
import { Center } from "@/styles/layouts";
import { Title } from "@/styles/typography";

const Index = ({ results }: InferGetStaticPropsType<typeof getStaticProps>) => (
	<>
		<DocumentHead
			title="Keebs"
			description="Mechanical keyboards and their components that I own"
		/>

		<Center>
			<Title $size={5}>/keebs</Title>
		</Center>

		<Keebs results={results} />

		<ViewsCounter />
	</>
);

export async function getStaticProps() {
	const results = await getKeebsFromNotion();

	return {
		props: { results },
	};
}

export default Index;
