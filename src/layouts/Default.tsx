import type { PropsWithChildren } from "react";

import { Navbar } from "components/Navbar";
import { FoobarWrapper } from "components/foobar";
import { GlobalStyles } from "styles";
import { Layout } from "styles/layouts";

export const DefaultLayout = ({ children }: PropsWithChildren<unknown>) => (
	<>
		<GlobalStyles />
		<FoobarWrapper>
			<Navbar />
			<Layout>{children}</Layout>
		</FoobarWrapper>
	</>
);
