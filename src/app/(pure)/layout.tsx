import type { ReactNode } from "react";

import { Footer } from "@/lib/components/Footer";
import { Header } from "@/lib/components/Header";
import { FoobarPixel } from "@/lib/domains/foobar/Pixel.client";

export default function MainLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<Header className="print:hidden" />
			<main id="main-content">{children}</main>
			<Footer className="print:hidden">
				<FoobarPixel />
			</Footer>
		</>
	);
}
