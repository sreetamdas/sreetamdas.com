import { InferGetStaticPropsType } from "next";
import React, { Fragment } from "react";

import { BlogPostPreview } from "components/blog";
import { Newsletter } from "components/blog/Newsletter";
import { generateRssFeed } from "components/blog/rss";
import { DocumentHead } from "components/shared/seo";
import { BlogPostsPreviewLayout, Center } from "styles/layouts";
import { Title } from "styles/typography";
import { PostDetails, TBlogPost } from "typings/blog";
import { getBlogPostsData } from "utils/blog";
import { getButtondownSubscriberCount } from "utils/misc";
import { supabase } from "utils/supabaseClient";

const Index = ({
	postsData,
	postsDetails,
	subscriberCount,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
	// eslint-disable-next-line no-console
	console.log({ postsDetails });

	return (
		<Fragment>
			<DocumentHead title="Blog" />
			<Center>
				<Title size={5}>/blog</Title>
			</Center>

			<BlogPostsPreviewLayout>
				{postsData?.map((post, index) => (
					<BlogPostPreview {...{ post }} key={index} />
				))}
			</BlogPostsPreviewLayout>

			<Newsletter {...{ subscriberCount }} />
		</Fragment>
	);
};

export const getStaticProps = async () => {
	const subscriberCount = await getButtondownSubscriberCount();
	const postsData: Array<TBlogPost> = await getBlogPostsData();
	await generateRssFeed();
	const { postsDetails } = await getAllPostsDetails();

	return {
		props: { postsData, postsDetails, subscriberCount },
	};
};

export default Index;

/**
 * Get post details from supabase
 */
const getAllPostsDetails = async () => {
	const { data: postsDetails, error } = await supabase
		.from<PostDetails>("post-details")
		.select("*");

	return { postsDetails, error };
};
