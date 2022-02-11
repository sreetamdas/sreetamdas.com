import { Client } from "@notionhq/client";
import { InferGetStaticPropsType } from "next";
import { Fragment } from "react";

import { BooksList } from "@/components/Books";
import { ViewsCounter } from "@/components/ViewsCounter";
import { DocumentHead } from "@/components/shared/seo";
import { BOOKS_DATABASE_ID } from "@/config";
import { Center } from "@/styles/layouts";
import { Title } from "@/styles/typography";

const BooksPage = ({ results }: InferGetStaticPropsType<typeof getStaticProps>) => {
	return (
		<Fragment>
			<DocumentHead
				title="Books"
				// description="Mechanical keyboards and their components that I own"
			/>

			<Center>
				<Title size={5}>/books</Title>
			</Center>

			<BooksList results={results} />

			<ViewsCounter />
		</Fragment>
	);
};

export async function getStaticProps() {
	const notion = new Client({
		auth: process.env.NOTION_TOKEN,
	});

	const response = await notion.databases.query({
		database_id: BOOKS_DATABASE_ID,
		filter: {
			property: "Tags",
			select: { does_not_equal: "Want" },
		},
	});
	const { results } = response;

	return {
		props: { results },
	};
}

export default BooksPage;
