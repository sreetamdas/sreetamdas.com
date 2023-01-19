import { InferGetStaticPropsType } from "next";

import { ViewsCounter } from "@/components/ViewsCounter";
import { DocumentHead } from "@/components/shared/seo";
import { getShikiHtml, initialCodeExample, ShikiPlayground } from "@/components/shiki";
import { Center, Space } from "@/styles/layouts";
import { Title } from "@/styles/typography";

const ShikiPage = ({ initialHtml }: InferGetStaticPropsType<typeof getStaticProps>) => (
	<>
		<DocumentHead title="Shiki" />
		<Space />
		<Center>
			<Title $size={5}>/shiki</Title>
		</Center>

		<ShikiPlayground initialHtml={initialHtml} />

		<ViewsCounter />
	</>
);

export default ShikiPage;

export async function getStaticProps() {
	const initialHtml = await getShikiHtml(initialCodeExample);

	return {
		props: { initialHtml },
	};
}
