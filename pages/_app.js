import App from "next/app";
import React from "react";
import { createGlobalStyle, ThemeProvider } from "styled-components";

const theme = {
	colors: {
		primary: "#0070f3",
	},
};

const GlobalStyles = createGlobalStyle`
  	html,
	body {
	font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu,
		Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
	
	color: black;
	}

	
`;

export default class MyApp extends App {
	render() {
		const { Component, pageProps } = this.props;
		return (
			<ThemeProvider theme={theme}>
				<GlobalStyles />
				<Component {...pageProps} />
			</ThemeProvider>
		);
	}
}
