import { rootPages } from "@/generated";
import { MDXContent } from "@/lib/components/MDX";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { isNil } from "lodash-es";
import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { absoluteUrl, canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
	return rootPages.flatMap(({ page_slug, skip_page }) => {
		if (skip_page) return [];

		return {
			mdxPageSlug: page_slug,
		};
	});
}

export const Route = createFileRoute("/(main)/$slug")({
	component: MDXPageSlugPage,
	head: (ctx: any) => {
		const post = ctx.loaderData?.post;
		const titleBase = post?.title ?? post?.page_slug ?? "Page";
		const title = `${titleBase} ${SITE_TITLE_APPEND}`;
		const description = post?.description ?? SITE_DESCRIPTION;
		const canonical = canonicalUrl(post?.page_path ?? "/");
		const ogImage = post?.image ? absoluteUrl(post.image) : defaultOgImageUrl();

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
	loader: ({ params }: any) => {
		const post = rootPages.find((page) => page.page_slug === params.slug);

		if (isNil(post)) {
			throw notFound();
		}

		return { post };
	},
} as any);

function MDXPageSlugPage() {
	const { post } = Route.useLoaderData() as any;

	return (
		<>
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold tracking-tighter">
				/{post.page_slug}
			</h1>
			<MDXContent source={post.raw} />
			<ViewsCounter />
		</>
	);
}
