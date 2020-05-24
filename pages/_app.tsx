import React from "react";
import App from "next/app";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { Navbar } from "components/Navbar";
import { Center } from "components/Layouts";

const theme = {};

const GlobalStyles = createGlobalStyle`
	:root {
		--color-primary-accent: #5B34DA;
		--color-primary: #000;
		--color-background: #FFF;
	}

	[data-theme="dark"] {
		--color-primary-accent: #9D86E9;
		--color-primary: #FFF;
		--color-background: #000;
	}


  	html, body {
		font-size: 18px;
		font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu,
			Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
		color: var(--color-primary);
		background-color: var(--color-background);
		transition: 0.3 linear;
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
`;

export default class MyApp extends App {
	render() {
		const { Component, pageProps } = this.props;
		return (
			<ThemeProvider theme={theme}>
				<GlobalStyles />
				<Center>
					<Navbar />
					<Component {...pageProps} />
				</Center>
			</ThemeProvider>
		);
	}
}
