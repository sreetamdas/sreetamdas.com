import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { allBlogPosts } from "content-collections";

import { IS_DEV } from "@/config";
import { LinkTo } from "@/lib/components/Anchor";
import { getAllTags, getPostsByTag } from "@/lib/content/blog-tags";

export const getBlogTagRenderable = createServerFn({ method: "GET" })
	.validator((data) => {
		if (typeof data !== "object" || data === null || !("slug" in data)) {
			throw new Error("Invalid tag slug payload");
		}

		if (typeof data.slug !== "string") {
			throw new Error("Invalid tag slug payload");
		}

		return { slug: data.slug };
	})
	.handler(async ({ data }) => {
		const posts = getPostsByTag(allBlogPosts, data.slug, { includeDrafts: IS_DEV });
		const tag = getAllTags(allBlogPosts, { includeDrafts: IS_DEV }).find(
			(entry) => entry.slug === data.slug,
		);

		if (posts.length === 0 || !tag) {
			throw notFound();
		}

		const Renderable = await renderServerComponent(
			<section className="grid gap-20">
				{posts.map(
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

		return {
			tag: { name: tag.name, slug: tag.slug, count: tag.count },
			Renderable,
		};
	});
