import { useEffect, useState } from "react";
import { useTheme } from "styled-components";

import {
	StyledImage,
	TableOfContentsWrapper,
	TableOfContents,
	WideImagesContainer,
	CodeExampleWrapper,
	ColorPaletteWrapper,
	ColorPaletteBlock,
	LinksContainer,
	KARMA_COLOR_PALETTE,
	KARMA_LIGHT_COLOR_PALETTE,
	SwitchWrapper,
	SwitchLabel,
	Switch,
	SwitchThumb,
} from "./styled";

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
import { LinkTo, Title } from "@/styles/typography";

export const KarmaShowcase = () => {
	const { themeType } = useTheme();
	const [toggleDarkTheme, setToggleDarkTheme] = useState(true);
	const [isDefaultTheme, setIsDefaultTheme] = useState(true);

	function handleThemeToggle(checked: boolean) {
		setToggleDarkTheme(checked);
		setIsDefaultTheme(checked);
	}

	useEffect(() => {
		setIsDefaultTheme(themeType === "dark");
		setToggleDarkTheme(themeType === "dark");
	}, [themeType]);

	return (
		<>
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
					{themeLanguageMap.map(({ name }) => (
						<li key={name.toLowerCase()}>
							<a href={`#${name.toLowerCase()}`}>{name}</a>
						</li>
					))}
				</TableOfContents>
			</TableOfContentsWrapper>
			<SwitchWrapper>
				<SwitchLabel htmlFor="theme-switch">Light mode</SwitchLabel>
				<Switch id="theme-switch" checked={toggleDarkTheme} onCheckedChange={handleThemeToggle}>
					<SwitchThumb />
				</Switch>
				<SwitchLabel htmlFor="theme-switch">Dark mode</SwitchLabel>
			</SwitchWrapper>
			<WideImagesContainer>
				{themeLanguageMap.map(({ name, defaultImage, lightImage }, index) => {
					const image = isDefaultTheme ? defaultImage : lightImage;

					return (
						<CodeExampleWrapper key={name.toLowerCase()}>
							<Title $size={2.5} as="h2" id={name.toLowerCase()} $padding="0 0 20px 0">
								{name}
							</Title>
							<StyledImage
								src={image}
								alt={`Karma ${isDefaultTheme ? "" : "Light "}theme screenshot for ${name}`}
								priority={index === 0}
							/>
						</CodeExampleWrapper>
					);
				})}
			</WideImagesContainer>
		</>
	);
};

const themeLanguageMap = [
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
