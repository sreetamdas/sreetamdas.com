import { MDXProvider } from "@mdx-js/react";
import { AppProps } from "next/app";
import Head from "next/head";
import React, { useState, Fragment } from "react";
import { createGlobalStyle, ThemeProvider } from "styled-components";

import { Navbar } from "components/Navbar";
import { FoobarWrapper } from "components/foobar";
import { Layout } from "styles/layouts";
import { Paragraph } from "styles/typography";
import { TGlobalThemeObject } from "typings/styled";
import {
	MDXCodeBlock,
	MDXHeadingWrapper,
	MDXImageWithWrapper,
	MDXLinkWrapper,
} from "utils/mdx";
import { BASE_FONT_SIZE } from "utils/style";

export const MDXComponents = {
	p: Paragraph,
	h1: MDXHeadingWrapper.h1,
	h2: MDXHeadingWrapper.h2,
	h3: MDXHeadingWrapper.h3,
	pre: MDXCodeBlock,
	img: MDXImageWithWrapper,
	a: MDXLinkWrapper,
};

const GlobalStyles = createGlobalStyle`
	:root {
	--color-primary: rgb(0, 0, 0);
	--color-background: rgb(255, 255, 255);
	--color-inlineCode-fg: var(--color-primary);
	--color-inlineCode-bg: rgb(220, 220, 220);
	--color-primary-accent: rgb(91, 52, 218);
	--color-fancy-pants: rgb(91, 52, 218);
	--color-secondary-accent: rgb(53, 142, 241);
	--values-primary-accent: 91, 52, 218;

	--font-family-code: SFMono-Regular, Consolas, Roboto Mono, Menlo, Monaco,
		Liberation Mono, Lucida Console, monospace;
	--color-success-accent: rgb(0, 255, 127);
	--color-success-accent-faded: rgba(0, 255, 127, 0.19);
	--color-danger-accent: rgb(255, 128, 0);
	--color-danger-accent-faded: rgba(255, 128, 0, 0.2);
	--color-info-accent: rgb(0, 191, 255);
	--color-info-accent-faded: rgba(0, 191, 255, 0.27);
	--color-error: rgb(255, 0, 0);

	--max-width: 650px;
	--border-radius: 5px;
	}

	[data-theme="dark"] {
		--color-primary-accent: rgb(157, 134, 233);
		--color-secondary-accent: rgb(97, 218, 251);
		--color-primary: rgb(255, 255, 255);
		--color-background: rgb(0, 0, 0);
		--color-inlineCode-fg: var(--color-primary);
		--color-inlineCode-bg: rgb(51, 51, 51);
		--values-primary-accent: 157, 134, 233;
	}
	[data-theme="batman"] {
		--color-primary-accent: rgb(255, 255, 0);
		--color-secondary-accent: rgb(97, 218, 251);
		--color-primary: rgb(255, 255, 255);
		--color-background: rgb(0, 0, 0);
		--color-inlineCode-fg: var(--color-primary);
		--color-inlineCode-bg: rgb(34, 34, 34);
		--values-primary-accent: 255, 255, 0;
	}

	html,
	body {
		font-size: ${BASE_FONT_SIZE}px;
		font-family: -apple-system, BlinkMacSystemFont, Inter, Roboto, Segoe UI,
			Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
			sans-serif;
		color: var(--color-primary);
		background-color: var(--color-background);
		margin: 0;
		height: 100%;
		min-height: 100%;
		line-height: 1.6;
	}

	:not(pre):not(span)::selection {
		background: rgba(var(--values-primary-accent), 0.99);
		color: var(--color-background)
	}

	h1,
	h2,
	h3,
	h4 {
		margin: 0;
		padding-top: 2rem;
	}

	a {
		text-decoration: none;
		color: var(--color-primary-accent);
		cursor: pointer;

		&:visited {
			text-decoration: none;
		}
		&:hover {
			text-decoration: underline;
		}
	}

	code,
	pre {
		font-family: var(--font-family-code);
	}

	code {
		background-color: var(--color-inlineCode-bg);
		font-size: 75%;
		padding: 0.2em;
		border-radius: 3px;
		/* prevent our code block from being broken into different sections on linebreak
			https://developer.mozilla.org/en-US/docs/Web/CSS/box-decoration-break */
		box-decoration-break: clone;
		white-space: nowrap;
	}
`;

type TThemeObjectInitial = Pick<TGlobalThemeObject, "theme">;
const initTheme = {
	theme: undefined,
};

const MyApp = ({ Component, pageProps }: AppProps) => {
	const [themeObject, setThemeObject] = useState<TThemeObjectInitial>(
		initTheme
	);
	const getCSSVarValue = (variable: string) => {
		if (typeof window !== "undefined")
			return getComputedStyle(document.body).getPropertyValue(variable);
		return undefined;
	};
	const changeThemeVariant: TGlobalThemeObject["changeThemeVariant"] = (
		theme
	) => {
		setThemeObject({ theme });
	};
	const themeForContext: TGlobalThemeObject = {
		...themeObject,
		getCSSVarValue,
		changeThemeVariant,
	};

	return (
		<Fragment>
			<Head>
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
			</Head>
			<ThemeProvider theme={themeForContext}>
				<GlobalStyles />
				{/* @ts-expect-error */}
				<MDXProvider components={MDXComponents}>
					<FoobarWrapper>
						<Layout>
							<Navbar {...{ currentTheme: themeObject.theme }} />
							<Component {...pageProps} />
						</Layout>
					</FoobarWrapper>
				</MDXProvider>
			</ThemeProvider>
		</Fragment>
	);
};

export default MyApp;
