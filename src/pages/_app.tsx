import "focus-visible";
import { Hydrate, QueryClient, QueryClientProvider, DehydratedState } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { NextPage } from "next";
import PlausibleProvider from "next-plausible";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useState } from "react";
import type { PropsWithChildren } from "react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "styled-components";

import { getInitialColorMode } from "@/domains/style/darkmode";
import { DefaultLayout } from "@/layouts/Default";
import { theme, toasterProps, GlobalStyles } from "@/styles";
import { StyledThemeObject } from "@/typings/styled";

if (process.env.NEXT_PUBLIC_API_MOCKING_ENABLED === "true") {
	require("mocks");
}

type NextPageWithLayout = NextPage & {
	Layout?: ({ children }: PropsWithChildren<unknown>) => JSX.Element;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppPropsWithLayout = AppProps<{ dehydratedState: DehydratedState } & any> & {
	Component: NextPageWithLayout;
};

type ThemeObjectInitial = Pick<StyledThemeObject, "themeType" | "theme">;

const MyApp = ({ Component, pageProps }: AppPropsWithLayout) => {
	const [queryClient] = useState(() => new QueryClient());
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const initialTheme = getInitialColorMode()!;
	const [themeObject, setThemeObject] = useState<ThemeObjectInitial>({
		themeType: initialTheme,
		theme: theme[initialTheme],
	});
	function changeThemeVariant(themeType: StyledThemeObject["themeType"]) {
		setThemeObject((prevState) => ({ ...prevState, themeType, theme: theme[themeType] }));
	}
	const themeForContext: StyledThemeObject = {
		...themeObject,
		changeThemeVariant,
	};

	const ComponentLayout = Component.Layout ?? DefaultLayout;

	return (
		<>
			<Head>
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
			</Head>
			<QueryClientProvider client={queryClient}>
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
