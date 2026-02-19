import { createFileRoute } from "@tanstack/react-router";

import { isUndefined } from "lodash-es";

import { rootPages } from "@/generated";
import { MDXContent } from "@/lib/components/MDX";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

export const Route = createFileRoute("/(main)/")({
	component: Home,
	head: () => {
		const title = `Hello hello! ${SITE_TITLE_APPEND}`;
		const description = SITE_DESCRIPTION;
		const canonical = canonicalUrl("/");
		const ogImage = defaultOgImageUrl();

		return {
			links: [{ rel: "canonical", href: canonical }],
			meta: [
				{ title },
				{ name: "description", content: description },
				{ property: "og:title", content: `👋 Hello hello! ${SITE_TITLE_APPEND}` },
				{ property: "og:description", content: description },
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: canonical },
				{ property: "og:image", content: ogImage },
				{ name: "twitter:title", content: `👋 Hello hello! ${SITE_TITLE_APPEND}` },
				{ name: "twitter:description", content: description },
				{ name: "twitter:image", content: ogImage },
			],
		};
	},
	loader: () => {
		const post = rootPages.find((page) => page.page_slug === "introduction");

		if (isUndefined(post)) {
			throw new Error("introduction.mdx is missing");
		}

		return { post };
	},
});

function Home() {
	const { post } = Route.useLoaderData();
	return (
		<>
			<h1 className="py-20 text-center font-serif text-6xl font-bold tracking-tighter">
				Hey, I&apos;m Sreetam!{" "}
				<span role="img" aria-label="wave">
					👋
				</span>
			</h1>
			<MDXContent source={post.raw} mdast={post.mdast} shikiHighlights={post.shikiHighlights} />

			<ViewsCounter hidden />
		</>
	);
}
