import { Fragment } from "react";
import { GetStaticProps } from "next";

import { BlogPostsPreviewLayout } from "components/Layouts";
import { BlogPostPreview, Title } from "styled/blog";
import { getPostsData } from "utils/blog";

const Index = ({ postsData }: { postsData: Array<TBlogPost> }) => {
	return (
		<Fragment>
			<Title>FooBar: The Blog</Title>
			<BlogPostsPreviewLayout>
				{postsData?.map((post, index) => (
					<BlogPostPreview {...{ post }} key={index} />
				))}
			</BlogPostsPreviewLayout>
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
