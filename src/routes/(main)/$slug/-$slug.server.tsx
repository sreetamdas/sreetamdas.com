import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { allRootPages } from "content-collections";

import { IS_DEV } from "@/config";
import { RepoContributors } from "@/lib/components/GitHub/RepoContributors";
import { MDXContent } from "@/lib/components/MDX";
import { shouldServeRootPage } from "@/lib/content/visibility";
import { fetchRepoContributors } from "@/lib/domains/GitHub/server";

const rootPages = allRootPages;

function parseSlugPayload(data: unknown): { slug: string } {
	if (typeof data !== "object" || data === null || !("slug" in data)) {
		throw new Error("Invalid root page slug payload");
	}

	if (typeof data.slug !== "string") {
		throw new Error("Invalid root page slug payload");
	}

	return { slug: data.slug };
}

export const getRootPageRenderable = createServerFn({ method: "GET" })
	.validator((data) => parseSlugPayload(data))
	.handler(async ({ data }) => {
		const post = rootPages.find((page) => page.page_slug === data.slug);

		if (!post || !shouldServeRootPage(post, { includeDrafts: IS_DEV })) {
			throw notFound();
		}

		const contributors = data.slug === "credits" ? await fetchRepoContributors() : [];
		const Renderable = await renderServerComponent(
			<MDXContent
				source={post.raw}
				mdast={post.mdast}
				shikiHighlights={post.shikiHighlights}
				components={{
					RepoContributors: () => <RepoContributors contributors={contributors} />,
				}}
			/>,
		);

		return {
			post: {
				title: post.title,
				description: post.description,
				page_path: post.page_path,
				page_slug: post.page_slug,
			},
			Renderable,
		};
	});
