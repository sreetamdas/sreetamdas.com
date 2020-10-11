import { GetStaticPaths, GetStaticProps } from "next";
import dynamic from "next/dynamic";

import { Layout, TextGradient } from "styles/layouts";
import {
	BlogPostTitle,
	BlogPostMDXContent,
	Datestamp,
	PostNotPublishedWarning,
	RoundedImageSmall,
	PostMetaDataGrid,
} from "styles/blog";
import { getBlogPostsData } from "utils/blog";
import { Fragment } from "react";
import Head from "next/head";
import { ReadingProgress } from "components/Meh";

const Post = ({ post }: { post: TBlogPost }) => {
	const MDXPost = dynamic(() => import(`content/blog/${post.slug}.mdx`));

	return (
		<Fragment>
			<Head>
				<title>Blog &mdash; Sreetam Das</title>
			</Head>
			<ReadingProgress />
			<Layout>
				<BlogPostTitle>
					<TextGradient>{post.title}</TextGradient>
				</BlogPostTitle>
				<PostMetaDataGrid>
					<RoundedImageSmall src="/SreetamDas.jpg" />
					<Datestamp>
						Sreetam Das &bull;{" "}
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
	return { props: { post } };
};

export default Post;
