import { SocialLinks } from "@/lib/components/SocialLinks";
import { SITE_TITLE_APPEND } from "@/config";
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
	head: () => ({
		meta: [
			{
				title: `About ${SITE_TITLE_APPEND}`,
			},
		],
	}),
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
