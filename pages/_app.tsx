import React from "react";
import App from "next/app";

import { Center } from "components/Layouts";
import { Navbar } from "components/Navbar";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { MDXProvider } from "@mdx-js/react";
import { MDXCodeBlock } from "utils/mdx";

const theme = {};

const MDXComponents = {
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
	}

	[data-theme="dark"] {
		--color-primary-accent: #9D86E9;
		--color-primary: #FFF;
		--color-background: #000;
		--color-inlineCode-fg: #EB5757;
		--color-inlineCode-bg: #111;
	}


  	html, body {
		font-size: 18px;
		font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu,
			Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
		color: var(--color-primary);
		background-color: var(--color-background);
		transition: 0.3 linear;
		margin: 0;
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
		font-family: SFMono-Regular, Roboto Mono, Menlo, Monaco, Consolas, Liberation Mono, Lucida Console, monospace;
	}

	code {
		color: var(--color-inlineCode-fg);
		background-color: var(--color-inlineCode-bg);
		font-size: 85%;
		padding: 0.2em 0.4rem;
		border-radius: 5px;
	}
`;

export default class MyApp extends App {
	render() {
		const { Component, pageProps } = this.props;
		return (
			<ThemeProvider theme={theme}>
				<MDXProvider components={MDXComponents}>
					<GlobalStyles />
					<Center>
						<Navbar />
						<Component {...pageProps} />
					</Center>
				</MDXProvider>
			</ThemeProvider>
		);
	}
}
