import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import React from "react";

import { SectionContainer, BookWrapper, BookInfo, BookTitle } from "./styles";

import { CustomImage } from "@/components/mdx/images";

export type BookEntryProperties = {
	name: string;
	cover: string;
	status: string;
	author: string;
};

export const BooksList = ({ results }: Pick<QueryDatabaseResponse, "results">) => {
	const booksDetailsList = results.reduce((acc, result) => {
		if (!("properties" in result)) return acc;
		const { properties } = result;

		const details = {} as BookEntryProperties;

		// Process "Name"
		if ("title" in properties["Name"]) {
			// Empty cell
			if (properties["Name"].title.length === 0) return acc;

			details.name = properties["Name"].title[0].plain_text;
		}

		// Process "Cover"
		if ("files" in properties["Cover"] && properties["Cover"].files.length > 0) {
			const fileObject = properties["Cover"].files[0];
			if ("type" in fileObject && fileObject.type === "file") {
				details.cover = fileObject.file.url;
			} else if ("type" in fileObject && fileObject.type === "external") {
				details.cover = fileObject.external.url;
			}

			// Process "Status"
			if (properties["Status"]["type"] === "select") {
				const tagObject = properties["Status"];
				if (tagObject["type"] === "select") {
					// details.status = { name: tagObject.select?.name ?? "", color: tagObject.select?.color };
				}
			}
		}

		return [...acc, details];
	}, [] as Array<BookEntryProperties>);

	return (
		<SectionContainer>
			{booksDetailsList.map(({ name, cover }) => (
				<BookWrapper key={name.toLowerCase().replace(" ", "-")}>
					{cover ? <CustomImage src={cover} alt={name} /> : null}
					<BookInfo>
						<BookTitle>{name}</BookTitle>
					</BookInfo>
				</BookWrapper>
			))}
		</SectionContainer>
	);
};
