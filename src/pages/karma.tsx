import Image, { ImageProps } from "next/future/image";
import { useEffect, useState } from "react";
import styled, { css, useTheme } from "styled-components";

import { ViewsCounter } from "@/components/ViewsCounter";
import { DocumentHead } from "@/components/shared/seo";
import ImageCSS from "@/public/karma/default/css.webp";
import ImageElixir from "@/public/karma/default/elixir.webp";
import ImageGo from "@/public/karma/default/go.webp";
import ImagePhoenix from "@/public/karma/default/phoenix.webp";
import ImagePython from "@/public/karma/default/python.webp";
import ImageReact from "@/public/karma/default/react.webp";
import ImageRust from "@/public/karma/default/rust.webp";
import ImageSvelte from "@/public/karma/default/svelte.webp";
import ImageTypeScript from "@/public/karma/default/typescript.webp";
import ImageVue from "@/public/karma/default/vue.webp";
import ImageCSSLight from "@/public/karma/light/css.webp";
import ImageElixirLight from "@/public/karma/light/elixir.webp";
import ImageGoLight from "@/public/karma/light/go.webp";
import ImagePhoenixLight from "@/public/karma/light/phoenix.webp";
import ImagePythonLight from "@/public/karma/light/python.webp";
import ImageReactLight from "@/public/karma/light/react.webp";
import ImageRustLight from "@/public/karma/light/rust.webp";
import ImageSvelteLight from "@/public/karma/light/svelte.webp";
import ImageTypeScriptLight from "@/public/karma/light/typescript.webp";
import ImageVueLight from "@/public/karma/light/vue.webp";
import { Center, FullWidthWrapper, Space } from "@/styles/layouts";
import { LinkTo, Title } from "@/styles/typography";
import { breakpoint } from "@/utils/style";

const KARMA_COLOR_PALETTE = [
	"#FC618D",
	"#51C7DA",
	"#AF98E6",
	"#E3CF65",
	"#7BD88F",
	"#FD9353",
] as const;
const KARMA_LIGHT_COLOR_PALETTE = [
	"#FC618D",
	"#5688C7",
	"#6F42C1",
	"#FFAA33",
	"#2D972F",
	"#FA8D3E",
] as const;
type KarmaColors = typeof KARMA_COLOR_PALETTE[number] | typeof KARMA_LIGHT_COLOR_PALETTE[number];

const data = [
	{
		name: "React",
		defaultImage: ImageReact,
		lightImage: ImageReactLight,
	},
	{
		name: "Elixir",
		defaultImage: ImageElixir,
		lightImage: ImageElixirLight,
	},
	{
		name: "CSS",
		defaultImage: ImageCSS,
		lightImage: ImageCSSLight,
	},
	{
		name: "Go",
		defaultImage: ImageGo,
		lightImage: ImageGoLight,
	},
	{
		name: "Phoenix",
		defaultImage: ImagePhoenix,
		lightImage: ImagePhoenixLight,
	},
	{
		name: "Python",
		defaultImage: ImagePython,
		lightImage: ImagePythonLight,
	},
	{
		name: "Rust",
		defaultImage: ImageRust,
		lightImage: ImageRustLight,
	},
	{
		name: "Svelte",
		defaultImage: ImageSvelte,
		lightImage: ImageSvelteLight,
	},
	{
		name: "TypeScript",
		defaultImage: ImageTypeScript,
		lightImage: ImageTypeScriptLight,
	},
	{
		name: "Vue",
		defaultImage: ImageVue,
		lightImage: ImageVueLight,
	},
];

const KarmaPage = () => {
	const { themeType } = useTheme();
	const [isDefaultTheme, setIsDefaultTheme] = useState(true);

	useEffect(() => {
		setIsDefaultTheme(themeType === "dark");
	}, [themeType]);

	return (
		<>
			<DocumentHead
				title="Karma"
				imageURL="/karma/karma-card.jpg"
				description="A colorful VS Code theme by Sreetam Das"
			/>
			<Space />
			<Center>
				<MainTitle>Karma</MainTitle>
				<Title $size={3} $resetLineHeight $scaled>
					a colorful VS Code theme
				</Title>
			</Center>
			<ColorPaletteWrapper>
				{(isDefaultTheme ? KARMA_COLOR_PALETTE : KARMA_LIGHT_COLOR_PALETTE).map((color) => (
					<ColorPaletteBlock $color={color} key={color} $isDefaultTheme={isDefaultTheme}>
						{color}
					</ColorPaletteBlock>
				))}
			</ColorPaletteWrapper>
			<LinksContainer>
				<LinkTo href="https://marketplace.visualstudio.com/items?itemName=SreetamD.karma">
					Install from VS Code marketplace
				</LinkTo>

				<LinkTo href="https://github.com/sreetamdas/karma">View source</LinkTo>
			</LinksContainer>
			<TableOfContentsWrapper>
				<p>Check out examples:</p>
				<TableOfContents>
					{data.map(({ name }) => (
						<li key={name.toLowerCase()}>
							<a href={`#${name.toLowerCase()}`}>{name}</a>
						</li>
					))}
				</TableOfContents>
			</TableOfContentsWrapper>
			<WideImagesContainer>
				{data.map(({ name, defaultImage, lightImage }) => {
					const image = isDefaultTheme ? defaultImage : lightImage;

					return (
						<CodeExampleWrapper key={name.toLowerCase()}>
							<Title $size={2.5} as="h2" id={name.toLowerCase()} $padding="0 0 20px 0">
								{name}
							</Title>
							<StyledImage
								src={image}
								alt={`Karma ${isDefaultTheme ? "" : "Light "}theme screenshot for ${name}`}
							/>
						</CodeExampleWrapper>
					);
				})}
			</WideImagesContainer>

			<ViewsCounter />
		</>
	);
};

export default KarmaPage;

const MainTitle = styled.h1`
	font-size: clamp(1rem, 8rem, 20vw);
	padding: 0;
	line-height: 1;
`;

const FullScreenImage = styled.div`
	margin-top: -1.5rem;
	justify-self: center;
	border-radius: var(--border-radius);

	&,
	> img {
		max-width: 75vw;
		width: 100%;
		height: auto;

		${breakpoint.until.sm(css`
			max-width: 95vw;
		`)}
	}
`;

const StyledImage = (props: ImageProps) => (
	<FullScreenImage>
		<Image {...props} quality={100} placeholder={"blur"} unoptimized />
	</FullScreenImage>
);

const TableOfContentsWrapper = styled.div`
	display: flex;
	gap: 30px;
	padding-bottom: 50px;

	> p {
		margin: 0;

		${breakpoint.from.sm(css`
			flex-shrink: 0;
		`)}
	}
`;

const TableOfContents = styled.ul`
	display: flex;
	flex-wrap: wrap;
	margin: 0;
	padding: 0;
	column-gap: 30px;
	row-gap: 10px;

	li {
		display: inline;
		list-style: none;
	}
`;

const WideImagesContainer = styled(FullWidthWrapper)`
	display: flex;
	flex-direction: column;
	row-gap: 100px;
`;

const CodeExampleWrapper = styled.article`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const ColorPaletteWrapper = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
	padding-top: 50px;

	${breakpoint.until.sm(css`
		justify-content: center;
	`)}
`;

const ColorPaletteBlock = styled.div<{ $color: KarmaColors; $isDefaultTheme: boolean }>`
	display: grid;
	place-content: center;

	color: ${({ $isDefaultTheme }) => ($isDefaultTheme ? "#000" : "#FFF")};
	background-color: ${({ $color }) => $color};

	font-family: var(--font-family-code);

	height: 7rem;
	width: 5rem;
	border-radius: var(--border-radius);
`;

const LinksContainer = styled.div`
	display: flex;
	gap: 5rem;
	justify-content: center;
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
