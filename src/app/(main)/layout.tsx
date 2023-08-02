import { type ReactNode } from "react";

import { Footer } from "@/lib/components/Footer";
import { Header } from "@/lib/components/Header";

export default function MainLayout({ children }: { children: ReactNode }) {
	return (
		<div className="grid grid-flow-col grid-cols-[1fr_min(var(--max-width),_calc(100%_-_2rem))_1fr] grid-rows-[auto_1fr_max-content] gap-x-5">
			<Header />
			<main id="main-content" className="relative col-start-2 col-end-3 flex flex-col">
				{children}
			</main>
			<Footer />
		</div>
	);
}
