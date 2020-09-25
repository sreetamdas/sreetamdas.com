import React, { useState, Fragment } from "react";
import { AppProps } from "next/app";

import { Center } from "styles/layouts";
import { Navbar } from "components/Navbar";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { MDXProvider } from "@mdx-js/react";
import { MDXCodeBlock } from "utils/mdx";
import { Text } from "styles/blog";
import { FoobarWrapper } from "components/foobar";
import { TGlobalThemeObject } from "typings/styled";
import Head from "next/head";

const MDXComponents = {
	p: Text,
	pre: MDXCodeBlock,
	code: MDXCodeBlock,
};

const GlobalStyles = createGlobalStyle`
	:root {
		--color-primary-accent: #5B34DA;
		--color-primary: #000;
		--color-background: #FFF;
		--color-inlineCode-fg: #EB5757;
		--color-inlineCode-bg: #eee;
		--color-secondary-accent: #61DAFB;
		--font-family-code: SFMono-Regular, Consolas, Roboto Mono, Menlo, Monaco, Liberation Mono, Lucida Console, monospace;
	}

	[data-theme="dark"] {
		--color-primary-accent: #9D86E9;
		--color-secondary-accent: #61DAFB;
		--color-primary: #FFF;
		--color-background: #000;
		--color-inlineCode-fg: #EB5757;
		--color-inlineCode-bg: #222;
		--font-family-code: SFMono-Regular, Consolas, Roboto Mono, Menlo, Monaco, Liberation Mono, Lucida Console, monospace;
	}
	[data-theme="batman"] {
		--color-primary-accent: #FFFF00;
		--color-secondary-accent: #61DAFB;
		--color-primary: #FFF;
		--color-background: #000;
		--color-inlineCode-fg: #EB5757;
		--color-inlineCode-bg: #222;
		--font-family-code: SFMono-Regular, Consolas, Roboto Mono, Menlo, Monaco, Liberation Mono, Lucida Console, monospace;
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
	}

	h1, h2, h3 {
		margin: 20px 0 0 0;
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
		padding: 0.2em 0.4rem;
		border-radius: 5px;
		/* https://developer.mozilla.org/en-US/docs/Web/CSS/box-decoration-break */
		box-decoration-break: clone;
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
