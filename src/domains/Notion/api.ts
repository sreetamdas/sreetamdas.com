import { NotionClient } from "./client";

type Props = { pageId: string; propertyId: string };
/**
 * If property is paginated, returns an array of property items.
 *
 * Otherwise, it will return a single property item.
 */
export async function getPropertyValue({ pageId, propertyId }: Props) {
	const propertyItem = await NotionClient.pages.properties.retrieve({
		page_id: pageId,
		property_id: propertyId,
	});
	if (propertyItem.object === "property_item") {
		return propertyItem;
	}

	// Property is paginated.
	let nextCursor = propertyItem.next_cursor;
	const results = propertyItem.results;

	while (nextCursor !== null) {
		const propertyItem = await NotionClient.pages.properties.retrieve({
			page_id: pageId,
			property_id: propertyId,
			start_cursor: nextCursor,
		});

		nextCursor = propertyItem.next_cursor;
		results.push(...propertyItem.results);
	}

	return results;
}
