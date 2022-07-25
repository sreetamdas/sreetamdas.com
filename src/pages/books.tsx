import { InferGetStaticPropsType } from "next";

import { BooksList } from "@/components/Books";
import { ViewsCounter } from "@/components/ViewsCounter";
import { DocumentHead } from "@/components/shared/seo";
import { BOOKS_DATABASE_ID } from "@/config";
import { NotionClient } from "@/domains/Notion";
import { Center } from "@/styles/layouts";
import { Title } from "@/styles/typography";

const BooksPage = ({ results }: InferGetStaticPropsType<typeof getStaticProps>) => (
	<>
		<DocumentHead
			title="Books"
			// description="Mechanical keyboards and their components that I own"
		/>

		<Center>
			<Title $size={5}>/books</Title>
		</Center>

		<BooksList results={results} />

		<ViewsCounter />
	</>
);

export async function getStaticProps() {
	const response = await NotionClient.databases.query({
		database_id: BOOKS_DATABASE_ID,
		filter: {
			property: "Status",
			select: { does_not_equal: "Want" },
		},
	});
	const { results } = response;

	return {
		props: { results },
	};
}

export default BooksPage;
