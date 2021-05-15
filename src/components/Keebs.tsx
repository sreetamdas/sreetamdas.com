import {
	FilesPropertyValue,
	MultiSelectPropertyValue,
	Page,
	TitlePropertyValue,
} from "@notionhq/client/build/src/api-types";
import React from "react";
import styled from "styled-components";

import { RemoveBulletsFromList } from "styles/typography";
import { ImageWrapper } from "utils/mdx";

export type TKeebInfo = {
	keebInfo: Array<Page>;
};
const Keebs = ({ keebInfo }: TKeebInfo) => {
	const keebDetails = keebInfo.map(({ properties }) => {
		const name = (properties["Name"] as TitlePropertyValue).title[0].plain_text;
		const image: string | undefined = (
			properties["Image"] as FilesPropertyValue
		).files[0]?.name;
		const tags = (
			(properties["Type"] as MultiSelectPropertyValue)
				.multi_select as unknown as Array<
				MultiSelectPropertyValue["multi_select"]
			>
		).map(({ name, color }) => ({ name, color }));

		// console.log(name, image, tags);

		return { name, image, tags };
	});

	return (
		<RemoveBulletsFromList>
			<ul>
				{keebDetails.map(({ name, image, tags }) => (
					<li key={name.toLowerCase().replace(" ", "-")}>
						<KeebWrapper>
							<h3>{name}</h3>
							{tags.map((tag) => (
								<span key={tag.name}>{tag.name}</span>
							))}
							{image ? <ImageWrapper src={image} alt={name} /> : null}
						</KeebWrapper>
					</li>
				))}
			</ul>
		</RemoveBulletsFromList>
	);
};

export { Keebs };

const KeebWrapper = styled.div`
	display: grid;
	gap: 1rem;
`;
