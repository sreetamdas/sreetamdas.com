import { createFileRoute } from "@tanstack/react-router";

import { SITE_TITLE_APPEND } from "@/config";
import { LinkTo } from "@/lib/components/Anchor";
import { NotFound404 } from "@/lib/components/Error";
import { FoobarNotFoundAward } from "@/lib/domains/foobar/Pixel";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

import { getBlogTagRenderable } from "./-$tagSlug.server";

export const Route = createFileRoute("/(main)/blog/tag/$tagSlug")({
	component: RouteComponent,
	staleTime: 1000 * 60 * 60 * 24,
	loader: ({ params }: { params: { tagSlug: string } }) => {
		return getBlogTagRenderable({ data: { slug: params.tagSlug } });
	},
	head: ({ loaderData }) => {
		const tag = loaderData?.tag;
		if (!tag) {
			return { meta: [{ title: `Page not found ${SITE_TITLE_APPEND}` }] };
		}

		const title = `Posts tagged ${tag.name} ${SITE_TITLE_APPEND}`;
		const description = `Blog posts tagged ${tag.name}.`;
		const canonical = canonicalUrl(`/blog/tag/${tag.slug}`);
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
	notFoundComponent: () => (
		<>
			<NotFound404 message="The tag you're looking for doesn't exist :/" />
			<FoobarNotFoundAward />
		</>
	),
});

function RouteComponent() {
	const { tag, Renderable } = Route.useLoaderData();

	return (
		<>
			<h1 className="pt-10 font-serif text-8xl font-bold max-sm:text-5xl">#{tag.name}</h1>
			<p className="pb-20 text-sm text-foreground/60">
				{tag.count} {tag.count === 1 ? "post" : "posts"} ·{" "}
				<LinkTo href="/blog/tag">All tags</LinkTo>
			</p>

			{Renderable}
		</>
	);
}
