import AboutContent from "./about.mdx";

import { ViewsCounter } from "@/lib/domains/Supabase";

export default function AboutPage() {
	return (
		<>
			<h1 className="py-10 font-serif text-8xl">/about</h1>
			<AboutContent />
			{/* @ts-expect-error async Server Component */}
			<ViewsCounter slug="/" />
		</>
	);
}