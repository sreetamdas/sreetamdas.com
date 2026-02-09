import { createFileRoute, Link } from "@tanstack/react-router";
import { notFound } from "@tanstack/react-router";

import { IS_DEV, SITE_TITLE_APPEND } from "@/config";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";
import { aoc_solutions } from "@/generated";

export const Route = createFileRoute("/(main)/aoc/")({
	component: AdventOfCodeIndexPage,
	head: () => ({
		links: [{ rel: "canonical", href: canonicalUrl("/aoc") }],
		meta: [
			{ title: `Advent of Code ${SITE_TITLE_APPEND}` },
			{
				name: "description",
				content: "Writeups and notes for Advent of Code solutions",
			},
			{ property: "og:title", content: `Advent of Code ${SITE_TITLE_APPEND}` },
			{
				property: "og:description",
				content: "Writeups and notes for Advent of Code solutions",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: canonicalUrl("/aoc") },
			{ property: "og:image", content: defaultOgImageUrl() },
			{ name: "twitter:title", content: `Advent of Code ${SITE_TITLE_APPEND}` },
			{
				name: "twitter:description",
				content: "Writeups and notes for Advent of Code solutions",
			},
			{ name: "twitter:image", content: defaultOgImageUrl() },
		],
	}),
	loader: () => {
		if (!IS_DEV) {
			throw notFound();
		}

		return [...aoc_solutions].sort(
			(a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
		);
	},
});

function AdventOfCodeIndexPage() {
	const posts = Route.useLoaderData();

	return (
		<>
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold tracking-tighter">Advent of Code</h1>

			<section className="grid gap-8 pb-10">
				{posts.map((post) => {
					const [year, day] = post.page_slug.split("/");
					return (
						<article key={post.page_slug} className="border-primary/20 border-l-4 pl-4">
							<p className="text-sm uppercase opacity-70">{post.subheading}</p>
							<h2 className="font-serif text-3xl font-bold tracking-tight">
								<Link
									to="/aoc/$year/$day"
									params={{ year, day }}
									className="link-base text-primary hover:text-secondary"
								>
									{post.title.replaceAll("&shy;", "")}
								</Link>
							</h2>
							<p className="pt-2 text-sm opacity-80">{post.description}</p>
						</article>
					);
				})}
			</section>
		</>
	);
}
