import type { PropsWithChildren } from "react";

import { Navbar } from "@/components/Navbar";
import { FoobarWrapper } from "@/components/foobar";
import { Layout } from "@/styles/layouts";

export const DefaultLayout = ({ children }: PropsWithChildren<unknown>) => (
	<>
		<FoobarWrapper>
			<Navbar />
			<Layout>{children}</Layout>
		</FoobarWrapper>
	</>
);
