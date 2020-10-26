import { MDXProvider } from "@mdx-js/react";
import { AppProps } from "next/app";
import Head from "next/head";
import React, { useState, Fragment } from "react";
import { createGlobalStyle, ThemeProvider } from "styled-components";

import { Navbar } from "components/Navbar";
import { FoobarWrapper } from "components/foobar";
import { Text } from "styles/blog";
import { Center } from "styles/layouts";
import { TGlobalThemeObject } from "typings/styled";
import {
	MDXCodeBlock,
	MDXHeadingWrapper,
	MDXImageWithWrapper,
	MDXLinkWrapper,
} from "utils/mdx";

const MDXComponents = {
	p: Text,
	h1: MDXHeadingWrapper.h1,
	h2: MDXHeadingWrapper.h2,
	h3: MDXHeadingWrapper.h3,
	pre: MDXCodeBlock,
	img: MDXImageWithWrapper,
	a: MDXLinkWrapper,
};

const GlobalStyles = createGlobalStyle`
	:root {
		--color-primary-accent: #5B34DA;
		--color-primary: #000;
		--color-background: #FFF;
		--color-inlineCode-fg: #EB5757;
		--color-inlineCode-bg: #ddd;
		--color-secondary-accent: #358EF1;

		--font-family-code: SFMono-Regular, Consolas, Roboto Mono, Menlo, Monaco, Liberation Mono, Lucida Console, monospace;
		--color-success-accent: #00FF7F;
		--color-success-accent-faded: #00FF7F30;
		--color-danger-accent: #FF8000;
		--color-danger-accent-faded: #FF800033;
		--color-info-accent: #00BFFF;
		--color-info-accent-faded: #00BFFF44;

		--max-width: 650px;
		--border-radius: 5px;
	}

	[data-theme="dark"] {
		--color-primary-accent: #9D86E9;
		--color-secondary-accent: #61DAFB;
		--color-primary: #FFF;
		--color-background: #000;
		--color-inlineCode-fg: #EB5757;
		--color-inlineCode-bg: #222;
	}
	[data-theme="batman"] {
		--color-primary-accent: #FFFF00;
		--color-secondary-accent: #61DAFB;
		--color-primary: #FFF;
		--color-background: #000;
		--color-inlineCode-fg: #EB5757;
		--color-inlineCode-bg: #222;
	}


  	html, body {
		font-size: 18px;
		font-family: -apple-system, BlinkMacSystemFont, Inter, Roboto, Segoe UI, Oxygen, Ubuntu,
			Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
		color: var(--color-primary);
		background-color: var(--color-background);
		margin: 0;
		height: 100%;
		min-height: 100%;
		line-height: 1.6;
	}
	
	:not(pre):not(span)::selection {
		background: var(--color-primary-accent);
		color: var(--color-background);
	}

	h1, h2, h3, h4 {
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

	code, pre {
		font-family: var(--font-family-code);
	}

	code {
		color: var(--color-inlineCode-fg);
		background-color: var(--color-inlineCode-bg);
		font-size: 85%;
		padding: 0.2em;
		border-radius: 3px;
		/* prevent our code block from being broken into different sections on linebreak
		https://developer.mozilla.org/en-US/docs/Web/CSS/box-decoration-break */
		box-decoration-break: clone;
		white-space: nowrap;
	}
`;

type TThemeObjectInitial = Pick<TGlobalThemeObject, "theme">;
const MyApp = ({ Component, pageProps }: AppProps) => {
	const [themeObject, setThemeObject] = useState<TThemeObjectInitial>({
		theme: undefined,
	});
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
				<meta
					name="viewport"
					content="initial-scale=1.0, width=device-width"
				/>
			</Head>
			<ThemeProvider theme={themeForContext}>
				<GlobalStyles />
				{/* @ts-expect-error */}
				<MDXProvider components={MDXComponents}>
					<FoobarWrapper>
						<Center>
							<Navbar {...{ currentTheme: themeObject.theme }} />
							<Component {...pageProps} />
						</Center>
					</FoobarWrapper>
				</MDXProvider>
			</ThemeProvider>
		</Fragment>
	);
};

export default MyApp;
