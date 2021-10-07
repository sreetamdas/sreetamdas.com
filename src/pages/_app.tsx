import PlausibleProvider from "next-plausible";
import { AppProps } from "next/app";
import Head from "next/head";
import React, { Fragment, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Hydrate } from "react-query/hydration";
import { ThemeProvider } from "styled-components";

import { Navbar } from "components/Navbar";
import { FoobarWrapper } from "components/foobar";
import { GlobalStyles } from "styles";
import { Layout } from "styles/layouts";
import { TGlobalThemeObject } from "typings/styled";

import "assets/fonts/iosevka/iosevka.css";

if (process.env.NEXT_PUBLIC_API_MOCKING_ENABLED === "true") {
	require("mocks");
}

type TThemeObjectInitial = Pick<TGlobalThemeObject, "theme">;
const initTheme = {
	theme: undefined,
};

const MyApp = ({ Component, pageProps }: AppProps) => {
	const reactQueryClient = new QueryClient();
	const [themeObject, setThemeObject] = useState<TThemeObjectInitial>(initTheme);

	const getCSSVarValue = (variable: string) => {
		if (typeof window !== "undefined")
			return getComputedStyle(document.body).getPropertyValue(variable);
		return undefined;
	};
	const changeThemeVariant: TGlobalThemeObject["changeThemeVariant"] = (theme) => {
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
			<QueryClientProvider client={reactQueryClient}>
				<Hydrate state={pageProps.dehydratedState}>
					<ThemeProvider theme={themeForContext}>
						<PlausibleProvider domain="sreetamdas.com" customDomain="sreetamdas.com">
							<GlobalStyles />
							<FoobarWrapper>
								<Navbar />
								<Layout>
									<Component {...pageProps} />
								</Layout>
							</FoobarWrapper>
						</PlausibleProvider>
					</ThemeProvider>
				</Hydrate>
				<ReactQueryDevtools />
			</QueryClientProvider>
		</Fragment>
	);
};

export default MyApp;
