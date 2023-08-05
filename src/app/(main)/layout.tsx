import { type ReactNode } from "react";

import { Footer } from "@/lib/components/Footer";
import { Header } from "@/lib/components/Header";

export default function MainLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen">
			<Header />
			<main
				id="main-content"
				className="relative col-span-full grid grid-flow-col grid-cols-[1fr_min(var(--max-width),_calc(100%_-_2rem))_1fr] gap-x-5 children:[grid-column:2]"
			>
				{children}
			</main>
			<Footer />
		</div>
	);
}
