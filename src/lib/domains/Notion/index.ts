/**
 * Notion API boundary for keeb data. It supports both legacy database endpoints
 * and newer data-source endpoints so the site can survive Notion API migrations
 * without changing callers.
 */

import { type PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
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

	async retrieveDatabase(database_id: string): Promise<Record<string, unknown>> {
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

			const data = await response.json();
			if (!isRecord(data)) {
				throw new Error("Notion API returned unexpected data");
			}
			return data;
		}

		throw new Error("Notion database not found");
	}

	async getPropertiesIDs(database_id: string, filter_properties: Array<string>) {
		const data = await this.retrieveDatabase(database_id);
		const properties = getPropertyIdMap(data);

		return filter_properties.map((property) => ({
			name: property,
			id: properties[property] ?? "",
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

			const data = await response.json();
			if (!isQueryDatabasePageObjectResponse(data)) {
				throw new Error("Notion API returned unexpected data");
			}
			return data;
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

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function getPropertyIdMap(value: Record<string, unknown>): Record<string, string> {
	const rawProperties = value.properties;
	if (!isRecord(rawProperties)) {
		return {};
	}

	const entries = Object.entries(rawProperties).flatMap(([name, propertyValue]) => {
		if (!isRecord(propertyValue) || typeof propertyValue.id !== "string") {
			return [];
		}

		return [[name, propertyValue.id] as const];
	});

	return Object.fromEntries(entries);
}

function isPageResultEntry(
	value: unknown,
): value is QueryDatabasePageObjectResponse["results"][number] {
	if (!isRecord(value)) {
		return false;
	}

	return value.object === "page" && "properties" in value && isRecord(value.properties);
}

function isQueryDatabasePageObjectResponse(
	value: unknown,
): value is QueryDatabasePageObjectResponse {
	if (!isRecord(value) || !("results" in value) || !Array.isArray(value.results)) {
		return false;
	}

	return value.results.every((entry) => isPageResultEntry(entry));
}
