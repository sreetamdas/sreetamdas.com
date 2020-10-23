import { GetStaticProps } from "next";
import Head from "next/head";
import { Fragment } from "react";

import { BlogPostPreview, Title } from "styles/blog";
import { BlogPostsPreviewLayout, Layout } from "styles/layouts";
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
