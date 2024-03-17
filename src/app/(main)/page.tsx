import { isUndefined } from "lodash-es";

import { MDXContent } from "@/lib/components/MDX";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { allPages } from "contentlayer/generated";

export const runtime = "edge";

export default function HomePage() {
	const post = allPages.find((page) => page.page_slug === "introduction");

	if (isUndefined(post)) {
		throw new Error("introduction.mdx is missing");
	}

	return (
		<>
			<h1 className="py-20 text-center font-serif text-6xl">
				Hey, I&apos;m Sreetam!{" "}
				<span role="img" aria-label="wave">
					👋
				</span>
			</h1>
			<MDXContent code={post.body.code} />

			<ViewsCounter slug="/" hidden />
		</>
	);
}
