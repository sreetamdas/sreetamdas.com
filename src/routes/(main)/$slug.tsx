import { rootPages } from "@/generated";
import { MDXContent } from "@/lib/components/MDX";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { isNil } from "lodash-es";

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
	loader: ({ params: { slug } }) => {
		const post = rootPages.find((page) => page.page_slug === slug);

		if (isNil(post)) {
			throw notFound();
		}

		return { post };
	},
});

function MDXPageSlugPage() {
	const { post } = Route.useLoaderData();

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
