import React from "react";
import App from "next/app";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import { Navbar } from "components/Navbar";

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

	--primary-accent-color: #FF4500;
	
	color: white;
	/* background-color: #F6F7F8; */
	background-color: #000;
	}

	
`;

const Layout = styled.div`
	display: grid;
	/* padding: 0 200px; */
	grid-template-columns: minmax(0, 1fr) minmax(auto, 550px) minmax(0, 1fr);
`;

const Center = styled.div`
	display: grid;
	justify-items: center;
	grid-column: 2;
`;

export default class MyApp extends App {
	render() {
		const { Component, pageProps } = this.props;
		return (
			<ThemeProvider theme={theme}>
				<GlobalStyles />
				<Layout>
					<Center>
						<Navbar />
						<Component {...pageProps} />
					</Center>
				</Layout>
			</ThemeProvider>
		);
	}
}
