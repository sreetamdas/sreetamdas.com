import { Suspense } from "react";

import UsesMDX from "./uses.mdx";

import { ViewsCounter } from "@/lib/components/ViewsCounter";

export default function UsesPage() {
	return (
		<>
			<h1 className="py-10 font-serif text-8xl">/uses</h1>
			<UsesMDX />
			<Suspense>
				<ViewsCounter slug="/uses" />
			</Suspense>
		</>
	);
}
