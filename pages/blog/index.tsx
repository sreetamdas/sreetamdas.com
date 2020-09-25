import { Fragment } from "react";
import { GetStaticProps } from "next";

import { BlogPostsPreviewLayout, Layout } from "styles/layouts";
import { BlogPostPreview, Title } from "styles/blog";
import { getPostsData } from "utils/blog";
import Head from "next/head";

const Index = ({ postsData }: { postsData: Array<TBlogPost> }) => {
	return (
		<Fragment>
			<Head>
				<title>Blog &mdash; Sreetam Das</title>
			</Head>
			<Title>/blog</Title>
			<Layout>
				<BlogPostsPreviewLayout>
					{postsData?.map((post, index) => (
						<BlogPostPreview {...{ post }} key={index} />
					))}
				</BlogPostsPreviewLayout>
			</Layout>
		</Fragment>
	);
};

export const getStaticProps: GetStaticProps = async (_context) => {
	const postsData: Array<TBlogPost> = getPostsData();

	return {
		props: { postsData },
	};
};

export default Index;
