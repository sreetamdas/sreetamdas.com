import { IS_DEV, SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { blogPosts } from "@/generated";
import { LinkTo } from "@/lib/components/Anchor";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(main)/blog/")({
	component: BlogArchivePage,
	head: () => {
		const title = `Blog archive ${SITE_TITLE_APPEND}`;
		const description = SITE_DESCRIPTION;
		const canonical = canonicalUrl("/blog");
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
	loader: () =>
		blogPosts
			.flatMap(({ title, description, page_slug, page_path, url, published, published_at }) => {
				if (!IS_DEV && !published) {
					return [];
				}

				return {
					title,
					description,
					page_slug,
					page_path,
					published_at,
					url,
				};
			})
			.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()),
});

function BlogArchivePage() {
	const blog_posts_previews = Route.useLoaderData();

	return (
		<>
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold tracking-tighter">/blog</h1>
			<section className="grid gap-20">
				{blog_posts_previews.map(
					({ title, description, page_slug, page_path, published_at, url }) => (
						<article key={page_slug} className="group grid gap-y-2">
							<LinkTo
								href={url ?? page_path}
								className="w-fit bg-size-[0_4px] bg-position-[100%_85%] hover:bg-size-[100%_4px] hover:bg-position-[0_85%] hover:no-underline"
							>
								<h3 className="group-hover:gradient w-fit font-serif text-[40px] leading-normal font-semibold tracking-tight">
									{title}
								</h3>
							</LinkTo>
							<p className="">{description}</p>

							<div className="flex justify-start gap-x-6">
								<p className="text-sm">
									{new Date(published_at).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</p>
							</div>
						</article>
					),
				)}
			</section>
		</>
	);
}
