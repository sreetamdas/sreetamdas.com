import { Suspense } from "react";

import { KarmaShowcase } from "./Showcase";

import { SITE_TITLE_APPEND } from "@/config";
import { ViewsCounter } from "@/lib/components/ViewsCounter";

export const metadata = {
	title: `Karma ${SITE_TITLE_APPEND}`,
	description: "A colorful VS Code theme by Sreetam Das",
	// TODO add image for /karma
};

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
