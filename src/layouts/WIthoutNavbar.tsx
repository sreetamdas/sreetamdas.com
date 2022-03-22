import type { PropsWithChildren } from "react";

import { Footer } from "@/components/Footer";
import { Foobar } from "@/components/foobar";
import { ContentLayout, PageWrapper } from "@/styles/layouts";

export const WithoutNavbar = ({ children }: PropsWithChildren<unknown>) => (
	<PageWrapper>
		<ContentLayout>{children}</ContentLayout>
		<Foobar />
		<Footer />
	</PageWrapper>
);
