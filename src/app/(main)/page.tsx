import { Suspense } from "react";

import { ViewsCounter } from "@/lib/components/ViewsCounter";

export default function Home() {
	return (
		<>
			<h1 className="py-20 text-center font-serif text-6xl">
				Hey, I&apos;m Sreetam!{" "}
				<span role="img" aria-label="wave">
					👋
				</span>
			</h1>
			<Suspense>
				<ViewsCounter slug="/" hidden />
			</Suspense>
		</>
	);
}
