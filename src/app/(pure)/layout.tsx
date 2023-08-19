import { type ReactNode } from "react";

import { Footer } from "@/lib/components/Footer";
import { FoobarPixel } from "@/lib/domains/foobar/Pixel.client";

export default function MainLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<main id="main-content">{children}</main>
			<Footer>
				<FoobarPixel />
			</Footer>
		</>
	);
}
