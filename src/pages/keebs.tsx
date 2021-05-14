import { Client } from "@notionhq/client";
import { DatabasesQueryResponse } from "@notionhq/client/build/src/api-endpoints";
import { TitlePropertyValue } from "@notionhq/client/build/src/api-types";
import { GetStaticProps } from "next";
import { Fragment } from "react";

import { DocumentHead } from "components/shared/seo";
import { Center } from "styles/layouts";
import { Title } from "styles/typography";

const KEEBS_DATABASE_ID = "3539f182858f424f9cc2563c07dc300d";

const Keebs = ({ response }: { response: DatabasesQueryResponse }) => {
	const names: Array<string> = response.results.map(({ properties }) => {
		const NameProperty = properties["Name"] as TitlePropertyValue;
		const name = NameProperty.title[0].plain_text;

		return name;
	});

	return (
		<Fragment>
			<DocumentHead title="Keebs" />

			<Center>
				<Title size={5}>/keebs</Title>
			</Center>

			<ul>
				{names.map((name) => (
					<li key={name.toLowerCase().replace(" ", "-")}>{name}</li>
				))}
			</ul>
		</Fragment>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	const notion = new Client({
		auth: process.env.NOTION_TOKEN,
	});

	const response = await notion.databases.query({
		database_id: KEEBS_DATABASE_ID,
		filter: { property: "Bought", checkbox: { equals: true } },
	});

	return {
		props: { response },
	};
};

export default Keebs;
