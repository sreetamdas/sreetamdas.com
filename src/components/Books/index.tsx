import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";

import { SectionContainer } from "./styles";

export type BookEntryProperties = {
	name: string;
	cover: string;
	status: string;
	author: string;
};

export const BooksList = ({ results: _ }: Pick<QueryDatabaseResponse, "results">) => (
	// const booksDetailsList = results.reduce((acc, result) => {
	// 	if (!("properties" in result)) return acc;
	// 	const { properties } = result;

	// 	const details = {} as BookEntryProperties;

	// 	// Process "Name"
	// 	if ("title" in properties["Name"]) {
	// 		// Empty cell
	// 		if (properties["Name"].title.length === 0) return acc;

	// 		details.name = properties["Name"].title[0].plain_text;
	// 	}

	// 	// Process "Cover"
	// 	if ("files" in properties["Cover"] && properties["Cover"].files.length > 0) {
	// 		const fileObject = properties["Cover"].files[0];
	// 		if ("type" in fileObject && fileObject.type === "file") {
	// 			details.cover = fileObject.file.url;
	// 		} else if ("type" in fileObject && fileObject.type === "external") {
	// 			details.cover = fileObject.external.url;
	// 		}

	// 		// Process "Status"
	// 		if (properties["Status"]["type"] === "select") {
	// 			const tagObject = properties["Status"];
	// 			if (tagObject["type"] === "select") {
	// 				// details.status = { name: tagObject.select?.name ?? "", color: tagObject.select?.color };
	// 			}
	// 		}
	// 	}

	// 	return [...acc, details];
	// }, [] as Array<BookEntryProperties>);

	<SectionContainer>
		{/* {booksDetailsList.map(({ name, cover }) => (
				<BookWrapper key={name.toLowerCase().replace(" ", "-")}>
					{cover ? <CustomImage src={cover} alt={name} /> : null}
					<BookInfo>
						<BookTitle>{name}</BookTitle>
					</BookInfo>
				</BookWrapper>
			))} */}
	</SectionContainer>
);

// type BookType = books;
// export async function handleBookUploadToNotion(book: BookType) {
// 	const { name: bookTitle, cover: coverImageURL, author, status } = book;
// 	const coverImageName = coverImageURL.split("/").pop();

// 	const response = await NotionClient.pages.create({
// 		parent: {
// 			database_id: BOOKS_DATABASE_ID,
// 		},
// 		properties: {
// 			Name: {
// 				type: "title",
// 				title: [
// 					{
// 						type: "text",
// 						text: {
// 							content: bookTitle,
// 						},
// 					},
// 				],
// 			},
// 			Cover: {
// 				type: "files",
// 				files: [{ type: "external", name: coverImageName, external: { url: coverImageURL } }],
// 			},
// 			Author: {
// 				type: "multi_select",
// 				multi_select: [
// 					{
// 						name: author,
// 					},
// 				],
// 			},
// 			Status: {
// 				type: "select",
// 				select: {
// 					name: status,
// 				},
// 			},
// 		},
// 	});

// 	return response;
// }
