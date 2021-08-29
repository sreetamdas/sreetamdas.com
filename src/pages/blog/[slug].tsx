import { GetStaticPaths, GetStaticProps } from "next";
import dynamic from "next/dynamic";
import React, { Fragment, useRef } from "react";

import { ScrollToTop, ShareLinks } from "components/blog";
import { Newsletter } from "components/blog/Newsletter";
import { ReadingProgress } from "components/blog/ProgressBar";
import { MDXWrapper } from "components/mdx";
import { DocumentHead } from "components/shared/seo";
import {
	BlogPostMDXContent,
	PostNotPublishedWarning,
	PostMetaDataGrid,
	EndLinks,
} from "styles/blog";
import { BlogPostTitle, TextGradient, Datestamp } from "styles/typography";
import { TBlogPost } from "typings/blog";
import { getBlogPostsData } from "utils/blog";
import { getButtondownSubscriberCount } from "utils/misc";

type TBlogPostPageProps = {
	post: TBlogPost;
	subscriberCount: number;
};

const Post = ({ post, subscriberCount }: TBlogPostPageProps) => {
	const MDXPost = dynamic(() => import(`content/blog/${post.slug}.mdx`), {
		loading: () => <div dangerouslySetInnerHTML={{ __html: post.content }} />,
	});
	const topRef = useRef<HTMLDivElement>(null);

	return (
		<Fragment>
			<DocumentHead title={post.title} imageURL={post?.image} description={post.summary} />
			<ReadingProgress />
			<div ref={topRef} />
			<BlogPostTitle>
				<TextGradient>{post.title}</TextGradient>
			</BlogPostTitle>
			<PostMetaDataGrid>
				<Datestamp>
					{new Date(post.publishedAt).toLocaleDateString("en-US", {
						month: "long",
						year: "numeric",
						day: "numeric",
					})}
					{!post.published && <PostNotPublishedWarning />}
				</Datestamp>
			</PostMetaDataGrid>
			<BlogPostMDXContent>
				<MDXWrapper>
					<MDXPost />
				</MDXWrapper>
			</BlogPostMDXContent>
			<EndLinks>
				<ShareLinks {...post} />
				<ScrollToTop topRef={topRef} />
			</EndLinks>
			<Newsletter {...{ subscriberCount }} />
		</Fragment>
	);
};

export const getStaticPaths: GetStaticPaths = async () => {
	const postsData: Array<TBlogPost> = await getBlogPostsData();

	const paths = postsData.map((post) => ({
		params: { slug: post.slug },
	}));

	return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<TBlogPostPageProps, { slug: string }> = async ({
	params,
}) => {
	const subscriberCount = await getButtondownSubscriberCount();
	const postsData = await getBlogPostsData();
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const post = postsData.find((postData) => postData.slug === params?.slug)!;

	return { props: { post, subscriberCount } };
};

export default Post;
