import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import React from "react";
import styled from "styled-components";

import { ImageWrapper } from "components/mdx";
import { sharedTransition } from "styles/components";

type TkeebDetails = {
	name: string;
	image?: string;
	tags: Array<{ name: string; color: string }>;
};
export type TKeebInfo = {
	keebInfo: QueryDatabaseResponse["results"];
};
const Keebs = ({ keebInfo }: TKeebInfo) => {
	const keebDetails = keebInfo.map(({ properties }) => {
		const details = {} as TkeebDetails;
		const { Name: nameField, Image: imageField, Type: typeField } = properties;

		if (nameField.type === "title") {
			details.name = nameField.title[0].plain_text;
		}
		if (imageField.type === "files") {
			details.image = imageField.files[0]?.name;
		}
		if (typeField.type === "multi_select") {
			details.tags = typeField.multi_select.map(({ name, color }) => ({
				name,
				color,
			}));
		}

		return details;
	});

	return (
		<KeebsContainer>
			{keebDetails.map(({ name, image, tags }) => (
				<KeebWrapper key={name.toLowerCase().replace(" ", "-")}>
					<Info>
						<h3>{name}</h3>
						<Tags>
							{tags.map((tag) => (
								<span key={tag.name}>{tag.name}</span>
							))}
						</Tags>
					</Info>
					{image ? <ImageWrapper src={image} alt={name} /> : null}
				</KeebWrapper>
			))}
		</KeebsContainer>
	);
};

export { Keebs };

const KeebsContainer = styled.section`
	display: grid;
	gap: 4rem;
`;

const KeebWrapper = styled.div`
	display: grid;
	gap: 1rem;
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

const Tags = styled.div`
	display: grid;
	gap: 0.5rem;
	grid-auto-flow: column;

	& span {
		font-size: 85%;
		font-family: var(--font-family-code);
		background-color: var(--color-primary-accent);
		color: var(--color-background);
		padding: 0px 10px;
		border-radius: var(--border-radius);

		${sharedTransition("color, background-color")}
	}
`;
