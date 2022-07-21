import styled from "styled-components";

import { CustomImage } from "@/components/mdx/images";
import { sharedTransition } from "@/styles/components";

export type KeebDetails = {
	name: string;
	image: {
		url: string;
	};
	tags: Array<{ name: string; color: string }>;
};

type Props = {
	results: Array<KeebDetails>;
};
export const Keebs = ({ results }: Props) => (
	<KeebsContainer>
		{results.map(({ name, image, tags }) => (
			<KeebWrapper key={name.toLowerCase().replace(" ", "-")}>
				<Info>
					<h3>{name}</h3>
					<Tags>
						{tags.map((tag) => (
							<span key={tag.name}>{tag.name}</span>
						))}
					</Tags>
				</Info>
				{image ? <CustomImage src={image.url} alt={name} /> : null}
			</KeebWrapper>
		))}
	</KeebsContainer>
);

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
