import { InferGetStaticPropsType } from "next";

import { NewsletterSignup } from "@/components/Newsletter/Signup";
import { ViewsCounter } from "@/components/ViewsCounter";
import { BlogPostPreview } from "@/components/blog";
import { generateRssFeed } from "@/components/blog/rss";
import { DocumentHead } from "@/components/shared/seo";
import { getButtondownSubscriberCount } from "@/domains/Buttondown";
import { BlogPostsPreviewLayout, Center } from "@/styles/layouts";
import { Title } from "@/styles/typography";
import { getAllBlogPostsPreviewData } from "@/utils/blog";

const Index = ({ postsData, subscriberCount }: InferGetStaticPropsType<typeof getStaticProps>) => (
	<>
		<DocumentHead title="Blog" />
		<Center>
			<Title $size={5}>/blog</Title>
		</Center>

		<BlogPostsPreviewLayout>
			{postsData?.map(({ frontmatter, slug }, index) => (
				<BlogPostPreview {...{ frontmatter, slug }} key={index} />
			))}
		</BlogPostsPreviewLayout>

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
