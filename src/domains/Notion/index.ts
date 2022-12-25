import { Client } from "@notionhq/client";
import {
	GetPagePropertyResponse,
	QueryDatabaseParameters,
	QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";

const notionEnabled =
	typeof process.env.NOTION_TOKEN !== "undefined" && process.env.NOTION_TOKEN !== "";
export const notionClient = notionEnabled
	? new Client({ auth: process.env.NOTION_TOKEN })
	: undefined;

type NotionClientUnknown =
	| {
			enabled: true;
			notionClient: Client;
	  }
	| {
			enabled: false;
			notionClient: undefined;
	  };
export function getNotionClient(): NotionClientUnknown {
	if (notionEnabled && typeof notionClient !== "undefined") {
		return {
			enabled: true,
			notionClient: notionClient,
		};
	}
	return {
		enabled: false,
		notionClient: undefined,
	};
}

type Props = { pageID: string; propertyID: string };
/**
 * If property is paginated, returns an array of property items.
 *
 * Otherwise, it will return a single property item.
 */
async function getPropertyValue({ pageID, propertyID }: Props) {
	const { enabled, notionClient: notionClient_ } = getNotionClient();
	if (!enabled) {
		return null;
	}

	const propertyItem = await notionClient_.pages.properties.retrieve({
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
		const nextPropertyItem = await notionClient_.pages.properties.retrieve({
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

type PropertiesValuesType<Properties extends readonly string[]> = Record<
	Properties[number],
	Awaited<ReturnType<typeof getPropertyValue>>
>;
/**
 * Parse Notion query database response into array of properties
 * @param properties Properties to retrieve.
 * @param options
 * @returns Array of values for each property in the Notion database
 */
export async function getPropertiesValues<Properties extends readonly string[]>(
	propertiesToRetrieve: Properties,
	options: GetPropertiesOptions
): Promise<Awaited<PropertiesValuesType<Properties>>[] | null> {
	const { enabled, notionClient: notionClient_ } = getNotionClient();
	if (!enabled) {
		return null;
	}

	let results: Extract<GetPropertiesOptions, OptionsResults>["results"];

	if ("query" in options) {
		results = (await notionClient_.databases.query(options.query)).results;
	} else {
		results = options.results;
	}

	const propertiesValues = (
		await Promise.all(
			results.map(async (result) => {
				// @ts-expect-error initialise properties values with empty object
				const propertiesObj: PropertiesValuesType<Properties> = {};

				if (!("properties" in result)) return null;
				const { id: pageID, properties } = result;

				await Promise.all(
					propertiesToRetrieve.map(async (property) => {
						propertiesObj[property as Properties[number]] = await getPropertyValue({
							pageID,
							propertyID: properties[property].id,
						});
					})
				);

				return propertiesObj;
			})
		)
	).flatMap((propertyObj) => (propertyObj === null ? [] : propertyObj));
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
