import { rootPages } from "@/generated";
import { MDXContent } from "@/lib/components/MDX";
import { RepoContributors } from "@/lib/components/GitHub/RepoContributors";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { fetchRepoContributors, type RepoContributor } from "@/lib/domains/GitHub";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { isNil } from "lodash-es";
import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

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
	loader: async ({ params }: { params: { slug: string } }) => {
		const post = rootPages.find((page) => page.page_slug === params.slug);

		if (isNil(post)) {
			throw notFound();
		}

		// Only fetch contributors for the credits page where RepoContributors is used
		const contributors = params.slug === "credits" ? await fetchRepoContributors() : [];

		return { post, contributors };
	},
});

function MDXPageSlugPage() {
	const { post, contributors } = Route.useLoaderData();

	return (
		<>
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold tracking-tighter">
				/{post.page_slug}
			</h1>
			<MDXContent
				source={post.raw}
				mdast={post.mdast}
				shikiHighlights={post.shikiHighlights}
				components={{
					RepoContributors: () => <RepoContributors contributors={contributors} />,
				}}
			/>
			<ViewsCounter />
		</>
	);
}
