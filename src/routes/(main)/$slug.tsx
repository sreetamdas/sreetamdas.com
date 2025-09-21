import { rootPages } from "@/generated";
import { MDXContent } from "@/lib/components/MDX";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { fetchRepoContributors } from "@/lib/domains/GitHub";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { isNil } from "lodash-es";
import { Image } from "@/lib/components/Image";

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
	loader: async ({ params: { slug } }) => {
		const post = rootPages.find((page) => page.page_slug === slug);
		const contributors = await fetchRepoContributors();

		if (isNil(post)) {
			throw notFound();
		}

		return { post, contributors };
	},
});

function MDXPageSlugPage() {
	const { post, contributors } = Route.useLoaderData();

	return (
		<>
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold tracking-tighter">
				/{post.page_slug}
			</h1>
			<MDXContent
				code={post.code}
				components={{ RepoContributors: () => <RepoContributors contributors={contributors} /> }}
			/>
			<ViewsCounter />
		</>
	);
}

// export async function generateMetadata(props: PageParams): Promise<Metadata> {
// 	const params = await props.params;
// 	const post = rootPages.find((page) => page.page_slug === params.mdxPageSlug);

// 	return {
// 		title: `${post?.seo_title ?? post?.title} ${SITE_TITLE_APPEND}`,
// 		description: post?.description,
// 		openGraph: {
// 			title: `${post?.seo_title ?? post?.title} ${SITE_TITLE_APPEND}`,
// 			description: post?.description,
// 			type: "article",
// 			url: `${SITE_URL}/${params.mdxPageSlug}`,
// 			images: { url: SITE_OG_IMAGE },
// 		},
// 		twitter: {
// 			card: "summary_large_image",
// 			title: `${post?.seo_title ?? post?.title} ${SITE_TITLE_APPEND}`,
// 			description: post?.description,
// 			images: { url: SITE_OG_IMAGE },
// 		},
// 	};
// }

const RepoContributors = async ({
	contributors,
}: {
	contributors: Awaited<ReturnType<typeof fetchRepoContributors>>;
}) => {
	return (
		<div className="flex flex-wrap gap-6 pt-4">
			{contributors?.map(
				({ login, avatar_url, html_url }) =>
					html_url && (
						<a href={html_url} key={login} target="_blank" className="link-base">
							<div className="flex flex-col items-center gap-1">
								{avatar_url ? (
									<span className="rounded-global size-32 overflow-hidden">
										<Image src={avatar_url} alt={login ?? ""} height={128} width={128} />
									</span>
								) : null}
								<p className="m-0 pb-2 text-sm">{login}</p>
							</div>
						</a>
					),
			)}
		</div>
	);
};
