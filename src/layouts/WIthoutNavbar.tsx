import type { PropsWithChildren } from "react";

import { Footer } from "@/components/Footer";
import { Foobar } from "@/components/foobar";
import { ContentLayout, PageWrapper, Space } from "@/styles/layouts";

export const WithoutNavbar = ({ children }: PropsWithChildren<unknown>) => (
	<PageWrapper>
		<ContentLayout>{children}</ContentLayout>
		<Space $size={50} />
		<Foobar />
		<Footer />
	</PageWrapper>
);
