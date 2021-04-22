import { GetStaticPaths, GetStaticProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { Fragment, useRef } from "react";

import { ScrollToTop, ShareLinks } from "components/blog";
import { Newsletter } from "components/blog/Newsletter";
import { ReadingProgress } from "components/blog/ProgressBar";
import {
	BlogPostMDXContent,
	PostNotPublishedWarning,
	PostMetaDataGrid,
	EndLinks,
} from "styles/blog";
import { BlogPostTitle, TextGradient, Datestamp } from "styles/typography";
import { TBlogPost } from "typings/blog";
import { getBlogPostsData } from "utils/blog";

const Post = ({ post }: { post: TBlogPost }) => {
	const MDXPost = dynamic(() => import(`content/blog/${post.slug}.mdx`), {
		loading: () => <div dangerouslySetInnerHTML={{ __html: post.content }} />,
	});
	const topRef = useRef<HTMLDivElement>(null);

	return (
		<Fragment>
			<Head>
				<title>{post.title} &mdash; Sreetam Das</title>
				<meta name="description" content={post.summary} />
				<meta property="og:title" content={post.title} />
				<meta name="og:description" content={post.summary} />
				<meta property="og:url" content="https://sreetamdas.com" />
				<meta property="og:type" content="website" />
				{post.image && <meta name="og:image" content={post.image} />}
				<meta name="og:image:alt" content={post.title} />

				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:site" content="@_SreetamDas" />
				<meta name="twitter:title" content={post.title} />
				<meta name="twitter:description" content={post.summary} />
				{post.image && <meta name="twitter:image" content={post.image} />}
			</Head>
			<ReadingProgress />
			<div ref={topRef} />
			<BlogPostTitle>
				<TextGradient>{post.title}</TextGradient>
			</BlogPostTitle>
			<PostMetaDataGrid>
				<Datestamp>
					{new Date(post.publishedAt).toLocaleDateString("en-US", {
						month: "long",
						year: "numeric",
						day: "numeric",
					})}
					{!post.published && <PostNotPublishedWarning />}
				</Datestamp>
			</PostMetaDataGrid>
			<BlogPostMDXContent>
				<MDXPost />
			</BlogPostMDXContent>
			<EndLinks>
				<ShareLinks {...post} />
				<ScrollToTop topRef={topRef} />
			</EndLinks>
			<Newsletter />
		</Fragment>
	);
};

export const getStaticPaths: GetStaticPaths = async () => {
	const postsData: Array<TBlogPost> = await getBlogPostsData();

	const paths = postsData.map((post) => ({
		params: { slug: post.slug },
	}));

	return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	if (!params) return { props: {} };
	const postsData = await getBlogPostsData();
	const post = postsData.find((postData) => postData.slug === params.slug)!;

	return { props: { post } };
};

export default Post;
