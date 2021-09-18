import { Client } from "@notionhq/client";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { Fragment } from "react";

import { Keebs } from "components/Keebs";
import { ViewsCounter } from "components/ViewsCounter";
import { DocumentHead } from "components/shared/seo";
import { Center } from "styles/layouts";
import { Title } from "styles/typography";

const KEEBS_DATABASE_ID = "3539f182858f424f9cc2563c07dc300d";

const Index = ({ response }: InferGetStaticPropsType<typeof getStaticProps>) => {
	return (
		<Fragment>
			<DocumentHead
				title="Keebs"
				description="Mechanical keyboards and their components that I own"
			/>

			<Center>
				<Title size={5}>/keebs</Title>
			</Center>

			<Keebs keebInfo={response.results} />

			<ViewsCounter />
		</Fragment>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	const notion = new Client({
		auth: process.env.NOTION_TOKEN,
	});

	const response = await notion.databases.query({
		database_id: KEEBS_DATABASE_ID,
		filter: {
			and: [
				{ property: "Bought", checkbox: { equals: true } },
				{ property: "Type", multi_select: { does_not_contain: "Switches" } },
			],
		},
	});

	return {
		props: { response },
	};
};

export default Index;
