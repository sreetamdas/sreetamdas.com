import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import React from "react";
import styled, { css } from "styled-components";

import { CustomImage, ImageWrapper } from "@/components/mdx/images";
import { fullWidthMixin } from "@/styles/layouts";
import { breakpoint } from "@/utils/style";

export type BookEntryProperties = {
	name: string;
	cover: string;
	status: string;
	author: string;
};

const BooksList = ({ results }: Pick<QueryDatabaseResponse, "results">) => {
	// console.log(results);

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
			}

			// Process "Tags"
			if (properties["Tags"]["type"] === "select") {
				const tagObject = properties["Tags"];
				if (tagObject["type"] === "select") {
					// details.status = { name: tagObject.select?.name ?? "", color: tagObject.select?.color };
				}
			}
		}

		return [...acc, details];
	}, [] as Array<BookEntryProperties>);

	return (
		<KeebsContainer>
			{booksDetailsList.map(({ name, cover }) => (
				<KeebWrapper key={name.toLowerCase().replace(" ", "-")}>
					<Info>
						<h3>{name}</h3>
					</Info>
					{cover ? <CustomImage src={cover} alt={name} /> : null}
				</KeebWrapper>
			))}
		</KeebsContainer>
	);
};

export { BooksList };

const KeebsContainer = styled.section`
	display: flex;
	gap: 25px;
	max-width: 80vw;
	flex-wrap: wrap;
	justify-content: center;

	${fullWidthMixin}

	margin: 0 auto;
`;

const KeebWrapper = styled.div`
	display: flex;
	gap: 16px;
	max-width: 30%;
	max-height: 500px;
	flex-wrap: wrap;

	${breakpoint.until.sm(css`
		width: 100%;
		max-width: unset;
	`)}

	${ImageWrapper} {
		& img {
			max-height: 450px;
		}
	}
`;

const Info = styled.div`
	display: grid;
	gap: 2rem;
	grid-auto-flow: column;
	align-items: center;
	justify-content: space-between;

	& h3 {
		padding-top: 0;
	}
`;
