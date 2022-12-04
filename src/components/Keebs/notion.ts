import { addImgurImagesData } from "./imgur";
import { KeebDetails } from "./types";

import { NotionClient, getPropertiesValues } from "@/domains/Notion";
import { getFiles, getMultiSelectNames, getTitlePlainText } from "@/domains/Notion/helpers";

const KEEBS_DATABASE_ID = "3539f182858f424f9cc2563c07dc300d";

export type KeebDetailsFromNotion = Omit<KeebDetails, "image"> & {
	image: Omit<KeebDetails["image"], "height" | "width">;
};

export async function getKeebsFromNotion() {
	const propertiesToRetrieve = ["Name", "Image", "Type"] as const;

	const { results } = await NotionClient.databases.query({
		database_id: KEEBS_DATABASE_ID,
		filter: {
			and: [
				{ property: "Bought", checkbox: { equals: true } },
				{ property: "Type", multi_select: { does_not_contain: "Switches" } },
			],
		},
	});

	const keebsDetails = await getPropertiesValues(propertiesToRetrieve, { results });

	const keebsDetailsFormatted = keebsDetails.map((keebDetails) => {
		const keebDetailsFormatted = (
			Object.keys(keebDetails) as Array<keyof typeof keebDetails>
		).reduce<KeebDetailsFromNotion>((details, property) => {
			const propertyValue = keebDetails[property];
			if (Array.isArray(propertyValue)) {
				if (propertyValue.length > 0 && propertyValue[0].type === "title") {
					details.name = getTitlePlainText(propertyValue[0]);
				}
			} else {
				if (propertyValue.type === "files") {
					details.image = { url: getFiles(propertyValue)[0] };
				}

				if (propertyValue.type === "multi_select") {
					details.tags = getMultiSelectNames(propertyValue);
				}
			}

			return details;
		}, {} as KeebDetails);

		return keebDetailsFormatted;
	});

	const keebsDetailsWithImgurData = await addImgurImagesData(keebsDetailsFormatted);

	return keebsDetailsWithImgurData;
}
