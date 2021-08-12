import Image, { ImageProps } from "next/image";
import React, { Fragment } from "react";
import styled from "styled-components";

import ImageCSS from "@/public/karma/css.webp";
import ImageElixir from "@/public/karma/elixir.webp";
import ImagePython from "@/public/karma/python.webp";
import ImageReact from "@/public/karma/react.webp";
import { DocumentHead } from "components/shared/seo";
import { FullWidth } from "styles/layouts";
import { LinkTo, Title } from "styles/typography";

const KARMA_COLOR_PALETTE = [
	"#FC618D",
	"#51C7DA",
	"#AF98E6",
	"#E3CF65",
	"#7BD88F",
	"#FD9353",
] as const;
type TKarmaColors = typeof KARMA_COLOR_PALETTE[number];

const Index = () => {
	return (
		<Fragment>
			<DocumentHead
				title="Karma"
				imageURL="/karma/karma-card.jpg"
				description="A colorful VSCode theme by Sreetam Das"
			/>
			<Title>Karma — a VSCode theme</Title>
			<ColorPaletteWrapper>
				{KARMA_COLOR_PALETTE.map((color) => (
					<ColorPaletteBlock color={color} key={color}>
						{color}
					</ColorPaletteBlock>
				))}
			</ColorPaletteWrapper>
			<LinksContainer>
				<LinkTo href="https://marketplace.visualstudio.com/items?itemName=SreetamD.karma">
					Install from VSCode marketplace
				</LinkTo>

				<LinkTo href="https://github.com/sreetamdas/karma">View source</LinkTo>
			</LinksContainer>
			<WideImagesContainer>
				<Title size={2.5} as="h2" id="react">
					React + TypeScript
				</Title>
				<StyledImage src={ImageReact} alt="Karma theme screenshot for React" />
				<Title size={2.5} as="h2" id="css">
					CSS
				</Title>
				<StyledImage src={ImageCSS} alt="Karma theme screenshot for CSS" />
				<Title size={2.5} as="h2" id="elixir">
					Elixir
				</Title>
				<StyledImage src={ImageElixir} alt="Karma theme screenshot for Elixir" />
				<Title size={2.5} as="h2" id="python">
					Python
				</Title>
				<StyledImage src={ImagePython} alt="Karma theme screenshot for Python" />
			</WideImagesContainer>
		</Fragment>
	);
};

export default Index;

const FullScreenImage = styled.div`
	margin-top: -40px;
	max-width: 95vw;
	justify-self: center;
	width: 100%;
	border-radius: var(--border-radius);
`;

const StyledImage = (props: ImageProps) => (
	<FullScreenImage>
		<Image {...props} quality={100} placeholder={"blur"} />
	</FullScreenImage>
);

const WideImagesContainer = styled(FullWidth)`
	display: grid;
	justify-items: center;
`;

const ColorPaletteWrapper = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	align-items: center;
	gap: 1rem;
`;

const ColorPaletteBlock = styled.div<{ color: TKarmaColors }>`
	display: grid;
	place-content: center;

	color: #000;
	background-color: ${({ color }) => color};

	font-family: var(--font-family-code);

	height: 7rem;
	width: 5rem;
	border-radius: var(--border-radius);
`;

const LinksContainer = styled.div`
	display: grid;
	gap: 1rem;
	justify-content: center;
	grid-auto-flow: column;
	padding: 40px 0;
`;

/**
 * many thanks to @NikkitaFTW and @_philpl for https://prism.dotenv.dev !
 */
export const KARMA_PRISM_THEME = {
	plain: {
		color: "#f7f1ff",
		backgroundColor: "#0a0e14",
	},
	styles: [
		{
			types: ["comment"],
			style: {
				color: "#696969",
				fontStyle: "italic" as const,
			},
		},
		{
			types: ["constant", "number", "builtin", "char"],
			style: {
				color: "#AF98E6",
			},
		},
		{
			types: ["symbol"],
			style: {
				color: "#FD9353",
			},
		},
		{
			types: ["class-name"],
			style: {
				color: "#51C7DA",
			},
		},
		{
			types: ["function", "inserted"],
			style: {
				color: "#7BD88F",
			},
		},
		{
			types: ["tag", "keyword", "operator", "deleted", "changed"],
			style: {
				color: "#FC618D",
			},
		},
		{
			types: ["attr-name"],
			style: {
				color: "#51C7DA",
				fontStyle: "italic" as const,
			},
		},
		{
			types: ["punctuation"],
			style: {
				color: "#88898F",
			},
		},
		{
			types: ["string"],
			style: {
				color: "#E3CF65",
			},
		},
		{
			types: ["property"],
			style: {
				color: "#D7D7D7",
			},
		},
		{
			types: ["variable"],
			style: {
				color: "#FD9353",
				fontStyle: "italic" as const,
			},
		},
	],
};
