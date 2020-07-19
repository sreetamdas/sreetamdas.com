import React, { Fragment } from "react";
import App from "next/app";

import { Center } from "components/styled/Layouts";
import { Navbar } from "components/Navbar";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { MDXProvider } from "@mdx-js/react";
import { MDXCodeBlock } from "utils/mdx";
import { Text } from "components/styled/blog";
import { Console } from "components/console";

const theme = {};

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
	}

	[data-theme="dark"] {
		--color-primary-accent: #9D86E9;
		--color-secondary-accent: #61DAFB;
		--color-primary: #FFF;
		--color-background: #000;
		--color-inlineCode-fg: #EB5757;
		--color-inlineCode-bg: #222;
	}
	[data-theme="foobar"] {
		--color-primary-accent: #FFFF00;
		--color-secondary-accent: #61DAFB;
		--color-primary: #FFF;
		--color-background: #000;
		--color-inlineCode-fg: #FFFF00;
		--color-inlineCode-bg: #222;
	}


  	html, body {
		font-size: 18px;
		font-family: -apple-system, BlinkMacSystemFont, Karla, Roboto, Segoe UI, Oxygen, Ubuntu,
			Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
		color: var(--color-primary);
		background-color: var(--color-background);
		transition: 0.3 linear;
		margin: 0;
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
		font-family: SFMono-Regular, Consolas, Roboto Mono, Menlo, Monaco, Liberation Mono, Lucida Console, monospace;
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

export default class MyApp extends App {
	render() {
		const { Component, pageProps } = this.props;
		return (
			<ThemeProvider theme={theme}>
				{/* @ts-expect-error */}
				<MDXProvider components={MDXComponents}>
					<GlobalStyles />
					<Fragment>
						{/* Components needed globally go here */}
						<Console />
					</Fragment>
					<Center>
						<Navbar />
						<Component {...pageProps} />
					</Center>
				</MDXProvider>
			</ThemeProvider>
		);
	}
}
