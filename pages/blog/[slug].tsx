import { GetStaticPaths, GetStaticProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import React, { Fragment, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FaLongArrowAltUp } from "react-icons/fa";

import { ReadingProgress } from "components/Meh";
import { ShareLinks } from "components/blog";
import { Newsletter } from "components/blog/Newsletter";
import {
	BlogPostTitle,
	BlogPostMDXContent,
	Datestamp,
	PostNotPublishedWarning,
	PostMetaDataGrid,
	EndLinks,
} from "styles/blog";
import { Layout, TextGradient } from "styles/layouts";
import { getBlogPostsData } from "utils/blog";

const Post = ({ post, mdxString }: { post: TBlogPost; mdxString: string }) => {
	const MDXPost = dynamic(() => import(`content/blog/${post.slug}.mdx`), {
		loading: () => <div dangerouslySetInnerHTML={{ __html: mdxString }} />,
	});
	const topRef = useRef<HTMLDivElement>(null);

	const scrollToTop = () => {
		if (topRef) topRef.current?.scrollIntoView({ behavior: "smooth" });
	};

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
				{post.image && (
					<meta name="twitter:image" content={post.image} />
				)}
			</Head>
			<ReadingProgress />
			<Layout ref={topRef}>
				<BlogPostTitle>
					<TextGradient>{post.title}</TextGradient>
				</BlogPostTitle>
				<PostMetaDataGrid>
					<Datestamp>
						{new Date(post.publishedAt).toLocaleDateString(
							"en-US",
							{
								month: "long",
								year: "numeric",
								day: "numeric",
							}
						)}
						{!post.published && <PostNotPublishedWarning />}
					</Datestamp>
				</PostMetaDataGrid>
				<BlogPostMDXContent>
					<MDXPost />
				</BlogPostMDXContent>
				<EndLinks>
					<ShareLinks {...post} />
					<span
						onClick={scrollToTop}
						role="button"
						tabIndex={0}
						aria-hidden={true}
					>
						back to the top
						<FaLongArrowAltUp style={{ fontSize: "20px" }} />
					</span>
				</EndLinks>
				<Newsletter />
			</Layout>
		</Fragment>
	);
};

export const getStaticPaths: GetStaticPaths = async () => {
	const postsData: Array<TBlogPost> = getBlogPostsData();

	const paths = postsData.map((post) => ({
		params: { slug: post.slug },
	}));

	return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	if (!params) return { props: {} };
	const postsData = getBlogPostsData();

	const post = postsData.find((postData) => postData.slug === params.slug);
	const { default: MDXContent } = await import(
		`content/blog/${post?.slug}.mdx`
	);
	const mdxString = renderToStaticMarkup(<MDXContent />);
	return { props: { post, mdxString } };
};

export default Post;
