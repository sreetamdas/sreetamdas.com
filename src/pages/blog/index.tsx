import { GetStaticProps } from "next";
import Head from "next/head";
import React, { Fragment } from "react";

import { BlogPostPreview } from "components/blog";
import { BlogPostsPreviewLayout, Layout } from "styles/layouts";
import { Title } from "styles/typography";
import { getBlogPostsData } from "utils/blog";

const Index = ({ postsData }: { postsData: Array<TBlogPost> }) => {
	return (
		<Fragment>
			<Head>
				<title>Blog &mdash; Sreetam Das</title>
			</Head>
			<Title size={5}>/blog</Title>
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
	const postsData: Array<TBlogPost> = getBlogPostsData();

	return {
		props: { postsData },
	};
};

export default Index;
