import "focus-visible";
import { Hydrate, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { NextPage } from "next";
import PlausibleProvider from "next-plausible";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useState } from "react";
import type { PropsWithChildren } from "react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "styled-components";

import { DefaultLayout } from "@/layouts/Default";
import { toasterProps, GlobalStyles } from "@/styles";
import { TGlobalThemeObject } from "@/typings/styled";

if (process.env.NEXT_PUBLIC_API_MOCKING_ENABLED === "true") {
	require("mocks");
}

type NextPageWithLayout = NextPage & {
	Layout?: ({ children }: PropsWithChildren<unknown>) => JSX.Element;
};

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};

type TThemeObjectInitial = Pick<TGlobalThemeObject, "theme">;
const initTheme = {
	theme: undefined,
};

const MyApp = ({ Component, pageProps }: AppPropsWithLayout) => {
	const reactQueryClient = new QueryClient();
	const [themeObject, setThemeObject] = useState<TThemeObjectInitial>(initTheme);
	const ComponentLayout = Component.Layout ?? DefaultLayout;

	function getCSSVarValue(variable: string) {
		if (typeof window !== "undefined")
			return getComputedStyle(document.body).getPropertyValue(variable);
		return undefined;
	}
	const changeThemeVariant: TGlobalThemeObject["changeThemeVariant"] = (theme) => {
		setThemeObject({ theme });
	};
	const themeForContext: TGlobalThemeObject = {
		...themeObject,
		getCSSVarValue,
		changeThemeVariant,
	};

	return (
		<>
			<Head>
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
			</Head>
			<QueryClientProvider client={reactQueryClient}>
				<Hydrate state={pageProps.dehydratedState}>
					<PlausibleProvider domain="sreetamdas.com" customDomain="sreetamdas.com">
						<ThemeProvider theme={themeForContext}>
							<GlobalStyles />
							<Toaster {...toasterProps} />
							<ComponentLayout>
								<Component {...pageProps} />
							</ComponentLayout>
						</ThemeProvider>
					</PlausibleProvider>
				</Hydrate>
				<ReactQueryDevtools />
			</QueryClientProvider>
		</>
	);
};

export default MyApp;
