import { isUndefined } from "lodash-es";

import { rootPages } from "@/generated";
import { MDXContent } from "@/lib/components/MDX";
import { ViewsCounter } from "@/lib/components/ViewsCounter";

export default function HomePage() {
	const post = rootPages.find((page) => page.page_slug === "introduction");

	if (isUndefined(post)) {
		throw new Error("introduction.mdx is missing");
	}

	return (
		<>
			<h1 className="py-20 text-center font-bold font-serif text-6xl tracking-tighter">
				Hey, I&apos;m Sreetam!{" "}
				<span role="img" aria-label="wave">
					👋
				</span>
			</h1>
			<MDXContent code={post.code} />

			<ViewsCounter slug="/" hidden />
		</>
	);
}
