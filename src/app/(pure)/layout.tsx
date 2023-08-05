import { type ReactNode } from "react";

import { Footer } from "@/lib/components/Footer";

export default function MainLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen">
			<main id="main-content">{children}</main>
			<Footer />
		</div>
	);
}
