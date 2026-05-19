import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { allRootPages } from "content-collections";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { MDXContent } from "@/lib/components/MDX";
import { SocialLinks } from "@/lib/components/SocialLinks";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { FoobarEntry } from "@/lib/domains/foobar/Entry";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

const rootPages = allRootPages;

export const Route = createFileRoute("/(main)/about")({
	component: AboutPage,
	loader: () => {
		return getAboutRenderable();
	},
	head: ({ loaderData }) => {
		const title = `About ${SITE_TITLE_APPEND}`;
		const description = loaderData?.post?.description ?? SITE_DESCRIPTION;
		const canonical = canonicalUrl("/about");
		const ogImage = defaultOgImageUrl();

		return {
			links: [{ rel: "canonical", href: canonical }],
			meta: [
				{ title },
				{ name: "description", content: description },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: canonical },
				{ property: "og:image", content: ogImage },
				{ name: "twitter:title", content: title },
				{ name: "twitter:description", content: description },
				{ name: "twitter:image", content: ogImage },
			],
		};
	},
	staleTime: 1000 * 60 * 60 * 24,
});

const getAboutRenderable = createServerFn({ method: "GET" })
	.middleware([staticFunctionMiddleware])
	.handler(async () => {
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

function AboutPage() {
	const { Renderable } = Route.useLoaderData();

	return (
		<>
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold">/about</h1>
			{Renderable}
			<ViewsCounter />
			<FoobarEntry />
		</>
	);
}
