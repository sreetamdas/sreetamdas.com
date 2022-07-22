import { Client } from "@notionhq/client";
import {
	GetPagePropertyResponse,
	QueryDatabaseParameters,
	QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";

export const NotionClient = new Client({
	auth: process.env.NOTION_TOKEN,
});

type Props = { pageID: string; propertyID: string };
/**
 * If property is paginated, returns an array of property items.
 *
 * Otherwise, it will return a single property item.
 */
export async function getPropertyValue({ pageID, propertyID }: Props) {
	const propertyItem = await NotionClient.pages.properties.retrieve({
		page_id: pageID,
		property_id: propertyID,
	});
	if (propertyItem.object === "property_item") {
		return propertyItem;
	}

	// Property is paginated.
	let nextCursor = propertyItem.next_cursor;
	const results = propertyItem.results;

	while (nextCursor !== null) {
		const nextPropertyItem = await NotionClient.pages.properties.retrieve({
			page_id: pageID,
			property_id: propertyID,
			start_cursor: nextCursor,
		});

		nextCursor = getNextCursor(nextPropertyItem);
		results.push(...getPropertyItemResults(nextPropertyItem));
	}

	return results;
}

type OptionsResults = {
	results: QueryDatabaseResponse["results"];
};
type OptionsQuery = {
	query: QueryDatabaseParameters;
};
export type GetPropertiesOptions = OptionsResults | OptionsQuery;

/**
 * Parse Notion query database response into array of properties
 * @param properties Properties to retrieve.
 * @param options
 * @returns Array of values for each property in the Notion database
 */
export async function getPropertiesValues(
	properties: string | Array<string>,
	options: GetPropertiesOptions
) {
	const propertiesToRetrieve = Array.isArray(properties) ? properties : [properties];
	let results: Extract<GetPropertiesOptions, OptionsResults>["results"];

	if ("query" in options) {
		results = (await NotionClient.databases.query(options.query)).results;
	} else {
		results = options.results;
	}

	const propertiesValues = await Promise.all(
		results.map(async (result) => {
			if (!("properties" in result)) return null;
			const { id: pageID, properties } = result;

			const propertiesObj: Record<string, unknown> = {};

			await Promise.all(
				propertiesToRetrieve.map(async (property) => {
					const rawValue = await getPropertyValue({ pageID, propertyID: properties[property].id });
					propertiesObj[property] = rawValue;
				})
			);

			return propertiesObj;
		})
	);
	return propertiesValues;
}

function getNextCursor(propertyItem: GetPagePropertyResponse): string | null {
	if (propertyItem.object === "property_item") {
		return null;
	}

	return propertyItem.next_cursor;
}

function getPropertyItemResults(propertyItem: GetPagePropertyResponse) {
	if (propertyItem.object === "property_item") {
		return [propertyItem];
	}

	return propertyItem.results;
}
