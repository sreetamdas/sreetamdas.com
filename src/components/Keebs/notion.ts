import { KeebDetails } from "./index";

import { NotionClient, getPropertyValue } from "@/domains/Notion";

const KEEBS_DATABASE_ID = "3539f182858f424f9cc2563c07dc300d";

export async function getKeebsFromNotion(): Promise<KeebDetails[]> {
	// const propertiesToRetrieve = ["Name", "Image", "Type"];

	const { results } = await NotionClient.databases.query({
		database_id: KEEBS_DATABASE_ID,
		filter: {
			and: [
				{ property: "Bought", checkbox: { equals: true } },
				{ property: "Type", multi_select: { does_not_contain: "Switches" } },
			],
		},
	});

	const keebsDetails = (
		await Promise.all(
			results.map(async (result) => {
				if (!("properties" in result)) return null;

				const { id: pageID, properties } = result;
				const {
					Name: { id: nameID },
					Image: { id: imageID },
					Type: { id: typeID },
				} = properties;

				const nameValue = await getPropertyValue({ pageID, propertyID: nameID });
				const imageValue = await getPropertyValue({ pageID, propertyID: imageID });
				const typeValue = await getPropertyValue({ pageID, propertyID: typeID });

				const details = {} as KeebDetails;

				const res = [nameValue, imageValue, typeValue].reduce((keebDetailsObj, propertyObj) => {
					// Name, title, returned as an array
					if (Array.isArray(propertyObj)) {
						if (propertyObj.length > 0 && propertyObj[0].type === "title") {
							keebDetailsObj.name = propertyObj[0].title.plain_text;
						}
					} else {
						if (propertyObj.type === "files") {
							const { name: url } = propertyObj.files[0];
							keebDetailsObj.image = { url };
						}

						if (propertyObj.type === "multi_select") {
							keebDetailsObj.tags = propertyObj.multi_select.map(({ name, color }) => ({
								name,
								color,
							}));
						}
					}

					return keebDetailsObj;
				}, details);

				return res;
			})
		)
	).flatMap((keebDetails) => (keebDetails ? keebDetails : []));

	return keebsDetails;
}
