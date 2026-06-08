/**
 * Keebs data adapter. Notion owns the keyboard catalogue, and Imgur optionally
 * enriches Notion image URLs with dimensions for better rendering.
 */
import { type PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { isEmpty, isUndefined } from "lodash-es";

import { ImgurClient, type KeebDetails } from "@/lib/domains/Imgur";
import { NotionClient } from "@/lib/domains/Notion";

export type KeebDetailsFromNotion = Omit<KeebDetails, "image"> & {
	image: Omit<KeebDetails["image"], "height" | "width">;
};

const propertiesToRetrieve = ["Name", "Type", "Image"];

export async function getKeebsFromNotion(
	env: CloudflareEnv,
): Promise<Array<KeebDetails | KeebDetailsFromNotion>> {
	const keebsDatabaseId = env.NOTION_KEEBS_PAGE_ID;
	const notionToken = env.NOTION_TOKEN;
	const imgurApiClientId = env.IMGUR_API_CLIENT_ID;
	const imgurKeebsAlbumHash = env.IMGUR_KEEBS_ALBUM_HASH;

	if (isUndefined(keebsDatabaseId) || isEmpty(keebsDatabaseId)) {
		return [];
	}

	if (isUndefined(notionToken) || isEmpty(notionToken)) {
		return [];
	}

	const notionClient = new NotionClient({ token: notionToken });

	let results: Awaited<ReturnType<typeof notionClient.queryDatabase>>["results"] = [];
	try {
		const response = await notionClient.queryDatabase(keebsDatabaseId, {
			filter: {
				and: [
					{ property: "Bought", checkbox: { equals: true } },
					{ property: "Type", multi_select: { does_not_contain: "Switches" } },
				],
			},
			filter_properties: propertiesToRetrieve,
		});
		results = response.results;
	} catch (error) {
		// oxlint-disable-next-line no-console
		console.error("[keebs] failed to query Notion", error);
		return [];
	}

	const keebsDetailsFormatted = results
		.map((keebDetails) => {
			const partial = Object.keys(keebDetails.properties).reduce<Partial<KeebDetailsFromNotion>>(
				(details, property) => {
					const propertyValue = keebDetails.properties[property];

					if (propertyValue.type === "title") {
						details.name = getTitlePlainText(propertyValue);
					}
					if (propertyValue?.type === "files") {
						details.image = { url: getFiles(propertyValue)[0] };
					}
					if (propertyValue?.type === "multi_select") {
						details.tags = getMultiSelectNames(propertyValue);
					}

					return details;
				},
				{},
			);

			return partial;
		})
		.filter((entry): entry is KeebDetailsFromNotion => isKeebDetailsFromNotion(entry));

	if (
		isUndefined(imgurApiClientId) ||
		isEmpty(imgurApiClientId) ||
		isUndefined(imgurKeebsAlbumHash) ||
		isEmpty(imgurKeebsAlbumHash)
	) {
		return keebsDetailsFormatted;
	}

	const imgurClient = new ImgurClient({
		client_id: imgurApiClientId,
		album_url: imgurKeebsAlbumHash,
	});

	try {
		return await imgurClient.addImgurImagesData(keebsDetailsFormatted);
	} catch (error) {
		// oxlint-disable-next-line no-console
		console.error("[keebs] failed to enrich images from Imgur", error);
		return keebsDetailsFormatted;
	}
}

type PageObjectResponseProperty =
	PageObjectResponse["properties"][keyof PageObjectResponse["properties"]];

function getTitlePlainText(input: Extract<PageObjectResponseProperty, { type: "title" }>) {
	return input.title[0].plain_text;
}

function isKeebDetailsFromNotion(
	value: Partial<KeebDetailsFromNotion>,
): value is KeebDetailsFromNotion {
	if (typeof value.name !== "string") {
		return false;
	}

	if (!Array.isArray(value.tags)) {
		return false;
	}

	if (
		typeof value.image !== "object" ||
		value.image === null ||
		typeof value.image.url !== "string"
	) {
		return false;
	}

	return true;
}

function getMultiSelectNames(input: Extract<PageObjectResponseProperty, { type: "multi_select" }>) {
	return input.multi_select.map(({ name }) => ({ name }));
}

function getFiles(input: Extract<PageObjectResponseProperty, { type: "files" }>) {
	return input.files
		.map((item) => {
			if (item.type === "external") return item.external.url;
			return item.file.url;
		})
		.filter((value): value is string => typeof value === "string" && value.length > 0);
}
