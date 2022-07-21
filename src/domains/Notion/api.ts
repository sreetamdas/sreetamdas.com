import { GetPagePropertyResponse } from "@notionhq/client/build/src/api-endpoints";

import { NotionClient } from "./client";

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
