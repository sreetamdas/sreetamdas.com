import { GetStaticPaths, GetStaticProps } from "next";
import dynamic from "next/dynamic";

import { Layout, TextGradient } from "components/styled/Layouts";
import {
	BlogPostTitle,
	BlogPostMDXContent,
	Datestamp,
	PostNotPublishedWarning,
	RoundedImageSmall,
	PostMetaDataGrid,
} from "components/styled/blog";
import { getPostsData } from "utils/blog";
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
	const postsData: Array<TBlogPost> = getPostsData();

	// Get the paths we want to pre-render based on posts
	const paths = postsData.map((post) => ({
		params: { slug: post.slug },
	}));

	// We'll pre-render only these paths at build time.
	// { fallback: false } means other routes should 404.
	return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const postsData = getPostsData();

	const post = postsData.find((postData) => postData.slug === params.slug);
	return { props: { post } };
};

export default Post;
