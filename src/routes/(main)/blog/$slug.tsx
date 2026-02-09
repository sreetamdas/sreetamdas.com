import { blogPosts } from "@/generated";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND } from "@/config";
import { absoluteUrl, canonicalUrl, defaultOgImageUrl } from "@/lib/seo";

import { MDXContent } from "@/lib/components/MDX";
import { ReadingProgress } from "@/lib/components/ProgressBar.client";
import { InfoBlock } from "@/lib/components/sink";
import { Gradient } from "@/lib/components/Typography";
import { ChameleonHighlight, Sparkles } from "@/lib/components/Typography.client";
import { ViewsCounter } from "@/lib/components/ViewsCounter";

import {
	HighlightWithUseEffect,
	HighlightWithUseInterval,
} from "./-chameleon-text/components.client";
import { isNil } from "lodash-es";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";

const page_slug = z.object({
	slug: z.string().min(1),
});

const getBlogContent = createServerFn({ method: "GET" })
	.inputValidator((data) => page_slug.parse(data))
	.handler(({ data: { slug } }) => {
		const post = blogPosts.find((page) => page.page_slug === slug);

		if (isNil(post)) {
			throw notFound();
		}

		return post;
	});

export const Route = createFileRoute("/(main)/blog/$slug")({
	component: RouteComponent,
	head: ({ loaderData }: any) => {
		const post = loaderData;
		const title = `${post?.seo_title ?? post?.title ?? "Blog"} ${SITE_TITLE_APPEND}`;
		const description = post?.description ?? SITE_DESCRIPTION;
		const canonical = canonicalUrl(post?.page_path ?? "/blog");
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
		return getBlogContent({ data: { slug: params.slug } });
	},
	notFoundComponent: () => (
		<>
			<h1 className="pt-10 text-center font-serif text-[160px] font-bold tracking-tighter">
				<Gradient>404!</Gradient>
			</h1>
			<p className="pt-4 text-center font-serif text-xl">
				The blog post you&apos;re trying to find doesn&apos;t exist :/
			</p>
		</>
	),
} as any);

function RouteComponent() {
	const post = Route.useLoaderData() as any;

	return (
		<>
			<ReadingProgress />
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold tracking-tighter">
				<Gradient>{post.title}</Gradient>
			</h1>

			<MDXContent
				source={post.raw}
				components={{
					ChameleonHighlight,
					Gradient,
					InfoBlock,
					Sparkles,

					// Post specific components
					HighlightWithUseEffect,
					HighlightWithUseInterval,
				}}
			/>

			<ViewsCounter />
		</>
	);
}

// export async function generateStaticParams() {
// 	return blogPosts.map((post) => ({
// 		slug: post.page_slug,
// 	}));
// }

// export async function generateMetadata(props: PageParams): Promise<Metadata> {
// 	const params = await props.params;
// 	const post = blogPosts.find((page) => page.page_slug === params.slug);

// 	return {
// 		title: `${post?.seo_title ?? post?.title} ${SITE_TITLE_APPEND}`,
// 		description: post?.description,
// 		openGraph: {
// 			title: `${post?.seo_title ?? post?.title} ${SITE_TITLE_APPEND}`,
// 			description: post?.description,
// 			type: "article",
// 			url: `${SITE_URL}/blog/${params.slug}`,
// 			images: { url: post?.image ?? SITE_OG_IMAGE },
// 		},
// 		twitter: {
// 			card: "summary_large_image",
// 			title: `${post?.seo_title ?? post?.title} ${SITE_TITLE_APPEND}`,
// 			description: post?.description,
// 			images: { url: post?.image ?? SITE_OG_IMAGE },
// 		},
// 	};
// }
