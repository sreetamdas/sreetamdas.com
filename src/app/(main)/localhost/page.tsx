import { notFound } from "next/navigation";
import { Suspense } from "react";

import MDXContent from "./test.mdx";

import { IS_DEV } from "@/config";
import { ViewsCounter } from "@/lib/components/ViewsCounter";

export default async function LocalhostPage() {
	if (!IS_DEV) {
		notFound();
	}

	return (
		<>
			<h1 className="py-10 font-serif text-8xl">/localhost</h1>
			<MDXContent />
			<Suspense>
				<ViewsCounter slug="/localhost" />
			</Suspense>
		</>
	);
}
