import { Suspense } from "react";

import { KarmaShowcase } from "./Showcase";

import { ViewsCounter } from "@/lib/components/ViewsCounter";

export default function KarmaPage() {
	return (
		<>
			<h1 className="pb-20 pt-10 text-center font-serif text-9xl leading-none">Karma</h1>
			<p className="text-center font-serif text-4xl">A colorful VS Code theme</p>
			<KarmaShowcase />
			<Suspense>
				<ViewsCounter slug="/karma" />
			</Suspense>
		</>
	);
}
