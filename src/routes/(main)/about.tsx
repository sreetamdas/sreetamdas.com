import { SocialLinks } from "@/lib/components/SocialLinks";
import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";
import { rootPages } from "@/generated";
import { MDXContent } from "@/lib/components/MDX";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { FoobarEntry } from "@/lib/domains/foobar/Entry.client";

import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/(main)/about")({
	component: AboutPage,
	loader: () => {
		const post = rootPages.find((page) => page.page_path === "/about");
		if (!post) {
			throw notFound();
		}
		return post;
	},
	head: ({ loaderData }) => {
		const title = `About ${SITE_TITLE_APPEND}`;
		const description = loaderData?.description ?? SITE_DESCRIPTION;
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
});

function AboutPage() {
	const post = Route.useLoaderData();

	return (
		<>
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold tracking-tighter">/about</h1>
			<MDXContent source={post.raw} components={{ SocialLinks }} />
			<ViewsCounter />
			<FoobarEntry />
		</>
	);
}
