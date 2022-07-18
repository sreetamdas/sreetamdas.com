import type { books } from "@prisma/client";

export { NotionClient } from "./client";
import { NotionClient } from "./client";

import { BOOKS_DATABASE_ID } from "@/config";

type BookType = books;
export async function handleBookUploadToNotion(book: BookType) {
	const { name: bookTitle, cover: coverImageURL, author, status } = book;
	const coverImageName = coverImageURL.split("/").pop();

	const response = await NotionClient.pages.create({
		parent: {
			database_id: BOOKS_DATABASE_ID,
		},
		properties: {
			Name: {
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
				type: "files",
				files: [{ type: "external", name: coverImageName, external: { url: coverImageURL } }],
			},
			Author: {
				type: "multi_select",
				multi_select: [
					{
						name: author,
					},
				],
			},
			Status: {
				type: "select",
				select: {
					name: status,
				},
			},
		},
	});

	return response;
}
