import { InferGetStaticPropsType } from "next";
import React, { Fragment } from "react";

import { ViewsCounter } from "@/components/ViewsCounter";
import { BlogPostPreview } from "@/components/blog";
import { Newsletter } from "@/components/blog/Newsletter";
import { generateRssFeed } from "@/components/blog/rss";
import { DocumentHead } from "@/components/shared/seo";
import { BlogPostsPreviewLayout, Center } from "@/styles/layouts";
import { Title } from "@/styles/typography";
import { getAllBlogPostsData } from "@/utils/blog";
import { getButtondownSubscriberCount } from "@/utils/misc";

const Index = ({ postsData, subscriberCount }: InferGetStaticPropsType<typeof getStaticProps>) => {
	return (
		<Fragment>
			<DocumentHead title="Blog" />
			<Center>
				<Title size={5}>/blog</Title>
			</Center>

			<BlogPostsPreviewLayout>
				{postsData?.map(({ frontmatter, slug }, index) => (
					<BlogPostPreview {...{ frontmatter, slug }} key={index} />
				))}
			</BlogPostsPreviewLayout>

			<ViewsCounter hidden />
			<Newsletter {...{ subscriberCount }} />
		</Fragment>
	);
};

export const getStaticProps = async () => {
	const subscriberCount = await getButtondownSubscriberCount();
	const postsData = await getAllBlogPostsData();

	await generateRssFeed();

	return {
		props: { postsData, subscriberCount },
	};
};

export default Index;
