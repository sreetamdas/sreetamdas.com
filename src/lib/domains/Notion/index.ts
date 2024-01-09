/**
 * Used for:
 * - Loading keebs' info usin Notion API
 */

import {
	type DatabaseObjectResponse,
	type PageObjectResponse,
	type QueryDatabaseResponse,
	type QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";
import { isEmpty, isUndefined } from "lodash-es";

type NotionClientOptions = {
	token?: string;
};
export class NotionClient {
	#token: string;

	constructor({ token }: NotionClientOptions) {
		if (isUndefined(token) || isEmpty(token)) {
			throw new Error("Notion auth token is missing");
		}

		this.#token = token;
	}

	async retrieveDatabase(database_id: string) {
		const query_string = `https://api.notion.com/v1/databases/${database_id}`;
		const response = await fetch(query_string, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${this.#token}`,
				"Notion-Version": "2022-06-28",
				"Content-Type": "application/json",
			},
			next: { revalidate: 3600 },
		});
		const data: DatabaseObjectResponse = await response.json();

		return data;
	}

	async getPropertiesIDs(database_id: string, filter_properties: Array<string>) {
		const data = await this.retrieveDatabase(database_id);

		return filter_properties.map((property) => ({
			name: property,
			id: data?.properties[property].id,
		}));
	}

	async queryDatabase(database_id: string, options: Omit<QueryDatabaseParameters, "database_id">) {
		const { filter_properties, ...filter } = options;
		let filter_properties_query = "";

		if (!isUndefined(filter_properties) && !isEmpty(filter_properties)) {
			const property_ids = await this.getPropertiesIDs(database_id, filter_properties);

			filter_properties_query =
				"?" + property_ids?.map(({ id }) => `filter_properties=${id}`).join("&");
		}

		const query_string = `https://api.notion.com/v1/databases/${database_id}/query${filter_properties_query}`;

		const response = await fetch(query_string, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${this.#token}`,
				"Notion-Version": "2022-06-28",
				"Content-Type": "application/json",
			},
			body: JSON.stringify(filter),
			next: { revalidate: 3600 },
		});

		const data: QueryDatabasePageObjectResponse = await response.json();
		return data;
	}
}

type QueryDatabasePageObjectResponse = Omit<QueryDatabaseResponse, "results"> & {
	results: Array<
		Extract<
			QueryDatabaseResponse["results"][number],
			{
				object: "page";
				properties: PageObjectResponse["properties"];
			}
		>
	>;
};
