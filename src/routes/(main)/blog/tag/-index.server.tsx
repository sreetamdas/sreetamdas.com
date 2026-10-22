import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { allBlogPosts } from "content-collections";

import { IS_DEV } from "@/config";
import { LinkTo } from "@/lib/components/Anchor";
import { getAllTags } from "@/lib/content/blog-tags";

export const getBlogTagsRenderable = createServerFn({ method: "GET" }).handler(async () => {
	const tags = getAllTags(allBlogPosts, { includeDrafts: IS_DEV });

	const Renderable = await renderServerComponent(
		<ul className="grid gap-x-12 gap-y-4 sm:grid-cols-2">
			{tags.map((tag) => (
				<li
					key={tag.slug}
					className="flex items-baseline justify-between gap-4 border-b border-solid border-foreground/10 pb-2"
				>
					<LinkTo href={`/blog/tag/${tag.slug}`} className="font-serif text-2xl font-semibold">
						{tag.name}
					</LinkTo>
					<span className="text-sm text-foreground/60">
						{tag.count} {tag.count === 1 ? "post" : "posts"}
					</span>
				</li>
			))}
		</ul>,
	);

	return { Renderable };
});
