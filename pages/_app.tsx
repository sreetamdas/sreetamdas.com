import React from "react";
import App from "next/app";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { Navbar } from "components/Navbar";
import { Center } from "components/Layouts";

const theme = {
	colors: {
		primary: "#0070f3",
	},
};

const GlobalStyles = createGlobalStyle`
	:root {
		--color-primary-accent: #FF4500;
		--color-primary: #FFF;
		--color-background: #000;
	}

  	html, body {
	font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu,
		Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
	color: var(--color-primary);
	background-color: var(--color-background);
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
