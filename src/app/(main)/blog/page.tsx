import { IS_DEV, SITE_TITLE_APPEND } from "@/config";
import { LinkTo } from "@/lib/components/Anchor";
import { allBlogPosts } from "contentlayer/generated";

export const metadata = {
	title: `Blog ${SITE_TITLE_APPEND}`,
};

export default async function BlogArchivePage() {
	const blog_posts_previews = await getAllBlogPostsPreviewsData();

	return (
		<>
			<h1 className="pb-20 pt-10 font-serif text-8xl">/blog</h1>
			<section className="grid gap-20">
				{blog_posts_previews.map(
					({ title, description, page_slug, page_path, published_at, url }) => (
						<article key={page_slug} className="group grid gap-y-2">
							<LinkTo href={url ?? page_path} className="w-fit hover:no-underline">
								<h3 className="group-hover:gradient w-fit font-serif text-5xl leading-normal">
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

async function getAllBlogPostsPreviewsData() {
	return allBlogPosts
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
		.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
}
