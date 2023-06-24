import { Suspense } from "react";

import Content from "./credits.mdx";

import { ViewsCounter } from "@/lib/components/ViewsCounter";

export default function AboutPage() {
	return (
		<>
			<h1 className="py-10 font-serif text-8xl">/credits</h1>
			<Content />
			<Suspense>
				<ViewsCounter slug="/about" />
			</Suspense>
		</>
	);
}
