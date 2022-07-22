import { KeebDetails } from "./index";

import { NotionClient, getPropertyValue, getPropertiesValues } from "@/domains/Notion";

const KEEBS_DATABASE_ID = "3539f182858f424f9cc2563c07dc300d";

export async function getKeebsFromNotion(): Promise<KeebDetails[]> {
	const propertiesToRetrieve = ["Name", "Image", "Type"];

	const { results } = await NotionClient.databases.query({
		database_id: KEEBS_DATABASE_ID,
		filter: {
			and: [
				{ property: "Bought", checkbox: { equals: true } },
				{ property: "Type", multi_select: { does_not_contain: "Switches" } },
			],
		},
	});

	const keebsDetails = getPropertiesValues(propertiesToRetrieve, { results });
	// if (Array.isArray(propertyObj)) {
	// 	if (propertyObj.length > 0 && propertyObj[0].type === "title") {
	// 		keebDetailsObj.name = propertyObj[0].title.plain_text;
	// 	}
	// } else {
	// 	if (propertyObj.type === "files") {
	// 		const { name: url } = propertyObj.files[0];
	// 		keebDetailsObj.image = { url };
	// 	}

	// 	if (propertyObj.type === "multi_select") {
	// 		keebDetailsObj.tags = propertyObj.multi_select.map(({ name, color }) => ({
	// 			name,
	// 			color,
	// 		}));
	// 	}
	// }

	return keebsDetails;
}
