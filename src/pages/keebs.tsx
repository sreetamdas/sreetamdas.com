import { Client } from "@notionhq/client";
import { DatabasesQueryResponse } from "@notionhq/client/build/src/api-endpoints";
import { GetStaticProps } from "next";
import { Fragment } from "react";

import { Keebs } from "components/Keebs";
import { DocumentHead } from "components/shared/seo";
import { Center } from "styles/layouts";
import { Title } from "styles/typography";

const KEEBS_DATABASE_ID = "3539f182858f424f9cc2563c07dc300d";

const Index = ({ response }: { response: DatabasesQueryResponse }) => {
	return (
		<Fragment>
			<DocumentHead title="Keebs" />

			<Center>
				<Title size={5}>/keebs</Title>
			</Center>

			<Keebs keebInfo={response.results} />
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
