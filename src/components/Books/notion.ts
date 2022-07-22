import { BOOKS_DATABASE_ID } from "@/config";
import { NotionClient, getPropertiesValues } from "@/domains/Notion";

export async function getKeebsFromNotion() {
	const propertiesToRetrieve = ["Name", "Cover", "Status"];
	const response = await NotionClient.databases.query({
		database_id: BOOKS_DATABASE_ID,
		filter: {
			property: "Status",
			select: { does_not_equal: "Want" },
		},
	});
	const { results } = response;

	const booksEntries = getPropertiesValues(propertiesToRetrieve, { results });
}
