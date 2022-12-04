import styled from "styled-components";

import type { KeebDetailsFromNotion } from "./notion";
import type { KeebDetails } from "./types";

import { CustomImage } from "@/components/mdx/images";
import { sharedTransition } from "@/styles/components";

type Props = {
	results: Array<KeebDetails | KeebDetailsFromNotion>;
};
export const Keebs = ({ results }: Props) => (
	<KeebsContainer>
		{results.map((imageObj) => {
			const { name, tags, image } = imageObj;

			const KeebImage = () => {
				if ("height" in image)
					return (
						<CustomImage src={image.url} alt={name} height={image.height} width={image.width} />
					);

				return <CustomImage src={image.url} alt={name} />;
			};

			return (
				<KeebWrapper key={name.toLowerCase().replace(" ", "-")}>
					<Info>
						<h3>{name}</h3>
						<Tags>
							{tags.map((tag) => (
								<span key={tag.name}>{tag.name}</span>
							))}
						</Tags>
					</Info>
					{image.url ? <KeebImage /> : null}
				</KeebWrapper>
			);
		})}
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
