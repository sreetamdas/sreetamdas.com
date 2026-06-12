import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { allBlogPosts } from "content-collections";

import { IS_DEV } from "@/config";
import { LinkTo } from "@/lib/components/Anchor";

const blogPosts = allBlogPosts;

export const getBlogArchiveRenderable = createServerFn({ method: "GET" }).handler(async () => {
	const blog_posts_previews = blogPosts
		.flatMap(
			({
				title,
				description,
				page_slug,
				page_path,
				url,
				published,
				published_at,
				reading_time,
			}) => {
				if (!IS_DEV && !published) {
					return [];
				}

				return {
					title,
					description,
					page_slug,
					page_path,
					published_at,
					reading_time,
					url,
				};
			},
		)
		.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

	const Renderable = await renderServerComponent(
		<section className="grid gap-20">
			{blog_posts_previews.map(
				({ title, description, page_slug, page_path, published_at, reading_time, url }) => (
					<article key={page_slug} className="group grid gap-y-2">
						<LinkTo
							href={url ?? page_path}
							className="w-fit bg-size-[0_4px] bg-position-[100%_85%] hover:bg-size-[100%_4px] hover:bg-position-[0_85%] hover:no-underline"
						>
							<h3 className="w-fit font-serif text-[40px] leading-normal font-semibold tracking-tight group-hover:gradient">
								{title}
							</h3>
						</LinkTo>
						<p className="">{description}</p>

						<div className="flex justify-start gap-x-6">
							<p className="text-sm">
								{new Date(published_at).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</p>
							{reading_time ? (
								<p className="text-sm text-foreground/60">{reading_time} min read</p>
							) : null}
						</div>
					</article>
				),
			)}
		</section>,
	);

	return { Renderable };
});
