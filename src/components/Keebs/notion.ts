import { NotionClient } from "@/domains/Notion";

const KEEBS_DATABASE_ID = "3539f182858f424f9cc2563c07dc300d";

export async function getKeebsFromNotion() {
	const response = await NotionClient.databases.query({
		database_id: KEEBS_DATABASE_ID,
		filter: {
			and: [
				{ property: "Bought", checkbox: { equals: true } },
				{ property: "Type", multi_select: { does_not_contain: "Switches" } },
			],
		},
	});

	return response;
}
