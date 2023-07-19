import { Suspense } from "react";

import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { FoobarEntry } from "@/lib/domains/foobar/Entry";

export default function AboutPage() {
	return (
		<>
			<h1 className="py-10 font-serif text-8xl">/about</h1>

			<Suspense>
				<ViewsCounter slug="/about" />
			</Suspense>
			<FoobarEntry />
		</>
	);
}
