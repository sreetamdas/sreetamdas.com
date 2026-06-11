import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { allRootPages } from "content-collections";

import { MDXContent } from "@/lib/components/MDX";
import { SocialLinks } from "@/lib/components/SocialLinks";

const rootPages = allRootPages;

export const getAboutRenderable = createServerFn({ method: "GET" }).handler(async () => {
	const post = rootPages.find((page) => page.page_path === "/about");
	if (!post) {
		throw notFound();
	}

	const Renderable = await renderServerComponent(
		<MDXContent
			source={post.raw}
			mdast={post.mdast}
			shikiHighlights={post.shikiHighlights}
			components={{ SocialLinks }}
		/>,
	);

	return { post, Renderable };
});
