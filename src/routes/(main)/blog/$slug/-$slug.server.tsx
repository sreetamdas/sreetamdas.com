import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { allBlogPosts } from "content-collections";

import { IS_DEV } from "@/config";
import { MDXContent } from "@/lib/components/MDX";
import { InfoBlock } from "@/lib/components/sink";
import { Gradient } from "@/lib/components/Typography";
import { ChameleonHighlight, Sparkles } from "@/lib/components/TypographyClient";
import { shouldServeBlogPost } from "@/lib/content/visibility";

import {
	HighlightWithUseEffect,
	HighlightWithUseInterval,
} from "../-chameleon-text/componentsClient";

const blogPosts = allBlogPosts;

export type BlogPost = (typeof blogPosts)[number];

async function getBlogContent(slug: string, includeDrafts: boolean): Promise<BlogPost> {
	const post = blogPosts.find((page) => page.page_slug === slug);

	if (!post || !shouldServeBlogPost(post, { includeDrafts })) {
		throw notFound();
	}

	return post;
}

export const getBlogRenderable = createServerFn({ method: "GET" })
	.validator((data) => {
		if (typeof data !== "object" || data === null || !("slug" in data)) {
			throw new Error("Invalid blog slug payload");
		}

		if (typeof data.slug !== "string") {
			throw new Error("Invalid blog slug payload");
		}

		return { slug: data.slug };
	})
	.handler(async ({ data }) => {
		const post = await getBlogContent(data.slug, IS_DEV);
		const Renderable = await renderServerComponent(
			<MDXContent
				source={post.raw}
				mdast={post.mdast}
				shikiHighlights={post.shikiHighlights}
				components={{
					ChameleonHighlight,
					Gradient,
					InfoBlock,
					Sparkles,

					HighlightWithUseEffect,
					HighlightWithUseInterval,
				}}
			/>,
		);

		return {
			post: {
				title: post.title,
				seo_title: post.seo_title,
				description: post.description,
				page_path: post.page_path,
				page_slug: post.page_slug,
				published_at: post.published_at,
				reading_time: post.reading_time,
				image: post.image,
			},
			Renderable,
		};
	});
