import { createFileRoute } from "@tanstack/react-router";

import { isUndefined } from "lodash-es";

import { rootPages } from "@/generated";
import { MDXContent } from "@/lib/components/MDX";
import { ViewsCounter } from "@/lib/components/ViewsCounter";

export const Route = createFileRoute("/(main)/")({
	component: Home,
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
			<MDXContent code={post.code} />

			<ViewsCounter hidden />
		</>
	);
}
