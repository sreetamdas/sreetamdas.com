import { type ReactNode } from "react";

import { Footer } from "@/lib/components/Footer";
import { Header } from "@/lib/components/Header";
import { FoobarPixel } from "@/lib/domains/foobar/Pixel.client";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(pure)")({
	component: MainLayout,
});

function MainLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<Header className="print:hidden" />
			<main id="main-content">
				<Outlet />
			</main>
			<Footer className="print:hidden">
				<FoobarPixel />
			</Footer>
		</>
	);
}
