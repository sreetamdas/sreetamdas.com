import React, { Fragment } from "react";
import styled from "styled-components";

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
			<DocumentHead title="Karma" />
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
				<Title size={2.5}>React</Title>
				<FullScreenImage
					src="/karma/react.png"
					alt="Karma theme screenshot for React"
				/>
				<Title size={2.5}>CSS</Title>
				<FullScreenImage
					src="/karma/css.png"
					alt="Karma theme screenshot for CSS"
				/>
				<Title size={2.5}>Elixir</Title>
				<FullScreenImage
					src="/karma/elixir.png"
					alt="Karma theme screenshot for Elixir"
				/>
				<Title size={2.5}>Python</Title>
				<FullScreenImage
					src="/karma/python.png"
					alt="Karma theme screenshot for Python"
				/>
			</WideImagesContainer>
		</Fragment>
	);
};

export default Index;

const WideImagesContainer = styled(FullWidth)`
	display: grid;
	justify-items: center;
`;

const FullScreenImage = styled.img.attrs({ tabIndex: 0 })`
	margin-top: -40px;
	max-width: 95vw;
	justify-self: center;
	width: 100%;
	border-radius: var(--border-radius);
`;

const ColorPaletteWrapper = styled.div`
	display: grid;
	grid-auto-flow: column;
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
