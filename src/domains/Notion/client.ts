import { Client } from "@notionhq/client";

export const NotionClient = new Client({
	auth: process.env.NOTION_TOKEN,
});
