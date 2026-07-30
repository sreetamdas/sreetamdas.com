import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { allRootPages } from "content-collections";

import { MDXContent } from "@/lib/components/MDX";

const rootPages = allRootPages;

export const getHomeRenderable = createServerFn({ method: "GET" }).handler(async () => {
	const post = rootPages.find((page) => page.page_slug === "introduction");

	if (!post) {
		throw new Error("introduction.mdx is missing");
	}

	const Renderable = await renderServerComponent(
		<MDXContent source={post.raw} mdast={post.mdast} shikiHighlights={post.shikiHighlights} />,
	);

	return { Renderable };
});
