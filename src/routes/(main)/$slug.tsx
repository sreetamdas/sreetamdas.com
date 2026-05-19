import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { allRootPages } from "content-collections";
import { isNil } from "lodash-es";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { RepoContributors } from "@/lib/components/GitHub/RepoContributors";
import { MDXContent } from "@/lib/components/MDX";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { fetchRepoContributors } from "@/lib/domains/GitHub/serverFns";
import { type RepoContributor } from "@/lib/domains/GitHub/types";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

const rootPages = allRootPages;

type RootPage = (typeof rootPages)[number];
type RootPageLoaderData = { post: RootPage; contributors: Array<RepoContributor> };

export const Route = createFileRoute("/(main)/$slug")({
	component: MDXPageSlugPage,
	head: ({ loaderData }: { loaderData?: RootPageLoaderData }) => {
		const post = loaderData?.post;
		const titleBase = post?.title ?? post?.page_slug ?? "Page";
		const title = `${titleBase} ${SITE_TITLE_APPEND}`;
		const description = post?.description ?? SITE_DESCRIPTION;
		const canonical = canonicalUrl(post?.page_path ?? "/");
		const ogImage = defaultOgImageUrl();

		return {
			links: [{ rel: "canonical", href: canonical }],
			meta: [
				{ title },
				{ name: "description", content: description },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:type", content: "article" },
				{ property: "og:url", content: canonical },
				{ property: "og:image", content: ogImage },
				{ name: "twitter:title", content: title },
				{ name: "twitter:description", content: description },
				{ name: "twitter:image", content: ogImage },
			],
		};
	},
	staleTime: 1000 * 60 * 60 * 24,
	loader: ({ params }: { params: { slug: string } }) => {
		return getRootPageRenderable({ data: { slug: params.slug } });
	},
});

const getRootPageRenderable = createServerFn({ method: "GET" })
	.inputValidator((data) => {
		if (
			typeof data !== "object" ||
			data === null ||
			typeof (data as { slug?: unknown }).slug !== "string"
		) {
			throw new Error("Invalid root page slug payload");
		}

		return { slug: (data as { slug: string }).slug };
	})
	.handler(async ({ data }) => {
		const post = rootPages.find((page) => page.page_slug === data.slug);

		if (isNil(post)) {
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

		return { post, contributors, Renderable };
	});

function MDXPageSlugPage() {
	const { post, Renderable } = Route.useLoaderData();

	return (
		<>
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold">/{post.page_slug}</h1>
			{Renderable}
			<ViewsCounter />
		</>
	);
}
