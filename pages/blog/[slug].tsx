import { GetStaticPaths, GetStaticProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ReadingProgress } from "components/Meh";
import {
	BlogPostTitle,
	BlogPostMDXContent,
	Datestamp,
	PostNotPublishedWarning,
	PostMetaDataGrid,
} from "styles/blog";
import { Layout, TextGradient } from "styles/layouts";
import { getBlogPostsData } from "utils/blog";

const Post = ({ post, mdxString }: { post: TBlogPost; mdxString: string }) => {
	const MDXPost = dynamic(() => import(`content/blog/${post.slug}.mdx`), {
		loading: () => <div dangerouslySetInnerHTML={{ __html: mdxString }} />,
	});

	return (
		<Fragment>
			<Head>
				<title>{post.title} &mdash; Sreetam Das</title>
				<meta name="description" content={post.summary} />
				<meta property="og:title" content={post.title} />
				<meta name="og:description" content={post.summary} />
				<meta property="og:url" content="https://sreetamdas.com" />
				<meta property="og:type" content="website" />

				<meta name="twitter:card" content="summary" />
				<meta name="twitter:site" content="@_SreetamDas" />
				<meta name="twitter:title" content={post.title} />
				<meta name="twitter:description" content={post.summary} />
			</Head>
			<ReadingProgress />
			<Layout>
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
