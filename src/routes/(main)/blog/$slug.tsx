import { blogPosts } from "@/generated";
import { createFileRoute, notFound, useLocation, useParams } from "@tanstack/react-router";

import { Balancer } from "react-wrap-balancer";
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
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { useQuery } from "@tanstack/react-query";
import z from "zod";

const page_slug = z.object({
	slug: z.string().min(1),
});

const getBlogContent = createServerFn({ method: "GET" })
	.inputValidator((data) => {
		console.log("validating");

		return page_slug.parse(data);
	})
	.handler(({ data: { slug } }) => {
		const post = blogPosts.find((page) => page.page_slug === slug);

		if (isNil(post)) {
			throw notFound();
		}

		return post;
	});

export const Route = createFileRoute("/(main)/blog/$slug")({
	component: RouteComponent,

	loader: ({ params: { slug } }) => {
		return getBlogContent({ data: { slug } });
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
});

function RouteComponent() {
	const post = Route.useLoaderData();

	// const { slug } = useParams({ from: "/(main)/blog/$slug" });
	// const getPost = useServerFn(() => getBlogContent({ data: { slug } }));
	// // const post = getPost({ data: { slug: Route.useParams().slug } });

	// // const getGitHubStats = useServerFn(fetchGitHubStats);

	// const { data: post, isLoading } = useQuery({
	// 	queryFn: getPost,
	// 	queryKey: ["blog-post", slug],
	// 	// staleTime: Infinity,
	// });

	// console.log({ post });

	// if (isNil(post)) {
	// 	throw notFound();
	// }

	// if (isLoading) {
	// 	return <span>loading</span>;
	// }

	console.log({ post });

	return (
		<>
			<ReadingProgress />
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold tracking-tighter">
				{/* <Balancer> */}
				<Gradient>{post.title}</Gradient>
				{/* </Balancer> */}
			</h1>

			<MDXContent
				code={post.code}
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
