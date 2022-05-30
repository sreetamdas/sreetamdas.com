import { InferGetStaticPropsType } from "next";

import { NewsletterSignup } from "@/components/Newsletter/Signup";
import { ViewsCounter } from "@/components/ViewsCounter";
import { BlogPostsPreviews } from "@/components/blog/PostPreview";
import { generateRssFeed } from "@/components/blog/rss";
import { DocumentHead } from "@/components/shared/seo";
import { getButtondownSubscriberCount } from "@/domains/Buttondown";
import { Center } from "@/styles/layouts";
import { Title } from "@/styles/typography";
import { getAllBlogPostsPreviewData } from "@/utils/blog";

const Index = ({ postsData, subscriberCount }: InferGetStaticPropsType<typeof getStaticProps>) => (
	<>
		<DocumentHead title="Blog" />
		<Center>
			<Title $size={5}>/blog</Title>
		</Center>
		<BlogPostsPreviews posts={postsData} />
		<ViewsCounter hidden />
		<NewsletterSignup {...{ subscriberCount }} />
	</>
);

export async function getStaticProps() {
	const subscriberCount = await getButtondownSubscriberCount();
	const postsData = await getAllBlogPostsPreviewData();

	await generateRssFeed();

	return {
		props: { postsData, subscriberCount },
	};
}

export default Index;
