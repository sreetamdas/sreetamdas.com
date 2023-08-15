import { Suspense } from "react";

import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { FoobarSchrodinger } from "@/lib/domains/foobar/Dashboard.client";

export default function FoobarArchivePage() {
	return (
		<Suspense>
			<FoobarSchrodinger completedPage="/" />
			<ViewsCounter slug="/foobar" />
		</Suspense>
	);
}
