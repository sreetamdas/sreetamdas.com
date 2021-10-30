import type { PropsWithChildren } from "react";

import { FoobarWrapper } from "components/foobar";
import { GlobalStyles } from "styles";
import { Layout } from "styles/layouts";

export const WithoutNavbar = ({ children }: PropsWithChildren<unknown>) => (
	<>
		<GlobalStyles />
		<FoobarWrapper>
			<Layout>{children}</Layout>
		</FoobarWrapper>
	</>
);
