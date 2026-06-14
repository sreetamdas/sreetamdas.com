import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { setResponseHeader } from "@tanstack/react-start/server";
import { allBlogPosts } from "content-collections";
import { isNil } from "lodash-es";

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
export type BlogLoaderData = {
	post: BlogPost;
	Renderable: unknown;
};

async function getBlogContent(slug: string, includeDrafts: boolean): Promise<BlogPost> {
	const post = blogPosts.find((page) => page.page_slug === slug);

	if (isNil(post) || !shouldServeBlogPost(post, { includeDrafts })) {
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
		// Baseline timing for the blog loader so we can measure what server-rendering
		// the like count later adds. Note: the Workers runtime clamps timers between
		// I/O, so CPU-only segments (MDX render) can read coarse in production —
		// treat client-side TTFB/Web Vitals as the primary signal.
		const startedAt = performance.now();
		const post = await getBlogContent(data.slug, IS_DEV);
		const renderStartedAt = performance.now();
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
		const finishedAt = performance.now();

		setResponseHeader(
			"Server-Timing",
			[
				`content;desc="blog lookup";dur=${(renderStartedAt - startedAt).toFixed(1)}`,
				`mdx;desc="MDX render";dur=${(finishedAt - renderStartedAt).toFixed(1)}`,
				`blogloader;desc="blog loader total";dur=${(finishedAt - startedAt).toFixed(1)}`,
			].join(", "),
		);

		return { post, Renderable };
	});
