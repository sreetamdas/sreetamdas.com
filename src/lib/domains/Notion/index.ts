/**
 * Used for:
 * - Loading keebs' info usin Notion API
 */

import {
	type DatabaseObjectResponse,
	type PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { isEmpty, isUndefined } from "lodash-es";

type QueryDatabaseOptions = {
	filter_properties?: Array<string>;
	[key: string]: unknown;
};

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
		const endpoints = [
			`https://api.notion.com/v1/databases/${database_id}`,
			`https://api.notion.com/v1/data_sources/${database_id}`,
		];

		for (const endpoint of endpoints) {
			const response = await fetch(endpoint, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${this.#token}`,
					"Notion-Version": "2022-06-28",
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				continue;
			}

			return (await response.json()) as DatabaseObjectResponse;
		}

		throw new Error("Notion database not found");
	}

	async getPropertiesIDs(database_id: string, filter_properties: Array<string>) {
		const data = await this.retrieveDatabase(database_id);
		const properties = (
			data as unknown as {
				properties: Record<string, { id: string }>;
			}
		).properties;

		return filter_properties.map((property) => ({
			name: property,
			id: properties[property].id,
		}));
	}

	async queryDatabase(database_id: string, options: QueryDatabaseOptions) {
		const { filter_properties, ...filter } = options;
		let filter_properties_query = "";

		if (!isUndefined(filter_properties) && !isEmpty(filter_properties)) {
			const property_ids = await this.getPropertiesIDs(database_id, filter_properties);

			filter_properties_query = `?${property_ids?.map(({ id }) => `filter_properties=${id}`).join("&")}`;
		}

		const endpoints = [
			`https://api.notion.com/v1/databases/${database_id}/query${filter_properties_query}`,
			`https://api.notion.com/v1/data_sources/${database_id}/query${filter_properties_query}`,
		];

		for (const endpoint of endpoints) {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${this.#token}`,
					"Notion-Version": "2022-06-28",
					"Content-Type": "application/json",
				},
				body: JSON.stringify(filter),
			});

			if (!response.ok) {
				continue;
			}

			return (await response.json()) as QueryDatabasePageObjectResponse;
		}

		return { results: [] };
	}
}

type QueryDatabasePageObjectResponse = {
	object?: string;
	results: Array<{
		object: "page";
		properties: PageObjectResponse["properties"];
	}>;
};
