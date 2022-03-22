import type { PropsWithChildren } from "react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Foobar } from "@/components/foobar";
import { PageWrapper, ContentLayout } from "@/styles/layouts";

export const DefaultLayout = ({ children }: PropsWithChildren<unknown>) => (
	<PageWrapper>
		<Navbar />
		<ContentLayout>{children}</ContentLayout>
		<Foobar />
		<Footer />
	</PageWrapper>
);
