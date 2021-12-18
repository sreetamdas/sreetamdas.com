import type { PropsWithChildren } from "react";

import { FoobarWrapper } from "@/components/foobar";
import { Layout } from "@/styles/layouts";

export const WithoutNavbar = ({ children }: PropsWithChildren<unknown>) => (
	<>
		<FoobarWrapper>
			<Layout>{children}</Layout>
		</FoobarWrapper>
	</>
);
