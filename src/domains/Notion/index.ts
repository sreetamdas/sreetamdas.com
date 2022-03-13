import { Client } from "@notionhq/client";
import type { books } from "@prisma/client";

import { BOOKS_DATABASE_ID } from "@/config";

export const notionClient = new Client({
	auth: process.env.NOTION_TOKEN,
});

type BookType = books;
export async function handleBookUploadToNotion(book: BookType) {
	const { name: bookTitle, cover: coverImageURL, author, status } = book;
	const coverImageName = coverImageURL.split("/").pop();

	const response = await notionClient.pages.create({
		parent: {
			database_id: BOOKS_DATABASE_ID,
		},
		properties: {
			Name: {
				// @ts-expect-error Notion is being weird
				type: "title",
				title: [
					{
						type: "text",
						text: {
							content: bookTitle,
						},
					},
				],
			},
			Cover: {
				// @ts-expect-error Notion is being weird
				type: "files",
				files: [{ type: "external", name: coverImageName, external: { url: coverImageURL } }],
			},
			Author: {
				// @ts-expect-error Notion is being weird
				type: "multi_select",
				multi_select: [
					{
						name: author,
					},
				],
			},
			Status: {
				// @ts-expect-error Notion is being weird
				type: "select",
				select: {
					name: status,
				},
			},
		},
	});

	return response;
}
