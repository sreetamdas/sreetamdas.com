import { getMDXComponent } from "mdx-bundler/client";
import { GetStaticPaths, GetStaticProps } from "next";
// import dynamic from "next/dynamic";
import React, { Fragment, useMemo, useRef } from "react";

import { MDXComponents } from "components/mdx";

// import { ScrollToTop, ShareLinks } from "components/blog";
// import { Newsletter } from "components/blog/Newsletter";
// import { ReadingProgress } from "components/blog/ProgressBar";
// import { MDXWrapper } from "components/mdx";
// import { DocumentHead } from "components/shared/seo";
// import {
// 	BlogPostMDXContent,
// 	PostNotPublishedWarning,
// 	PostMetaDataGrid,
// 	EndLinks,
// } from "styles/blog";
// import { BlogPostTitle, TextGradient, Datestamp } from "styles/typography";
import { TBlogPost } from "typings/blog";
import { getBlogPostData, getBlogPostsData, getBlogPostsSlugs } from "utils/blog";
import { getButtondownSubscriberCount } from "utils/misc";

type TBlogPostPageProps = {
	post: TBlogPost;
	subscriberCount: number;
};

const Post = ({ code }: TBlogPostPageProps) => {
	// const topRef = useRef<HTMLDivElement>(null);
	// const MDXPost = dynamic(() => import(`content/blog/${post.slug}.mdx`), {
	// 	loading: () => <div dangerouslySetInnerHTML={{ __html: post.content }} />,
	// });

	const Component = getMDXComponent(code);

	return (
		<Fragment>
			<Component />
			{/* <DocumentHead title={post.title} imageURL={post?.image} description={post.summary} />
			<ReadingProgress />
			<div ref={topRef} />
			<BlogPostTitle>
				<TextGradient>{post.title}</TextGradient>
			</BlogPostTitle>
			<BlogPostMDXContent>
				<MDXWrapper>
					<MDXPost />
				</MDXWrapper>
			</BlogPostMDXContent>
			<EndLinks>
				<ShareLinks {...post} />
				<ScrollToTop topRef={topRef} />
			</EndLinks>
			<PostMetaDataGrid>
				<Datestamp>
					Published:{" "}
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
			<ViewsCounter pageType="post" />
			<Newsletter {...{ subscriberCount }} /> */}
		</Fragment>
	);
};

export const getStaticPaths: GetStaticPaths = async () => {
	const postsSlugs = await getBlogPostsSlugs();
	console.log({ postsSlugs });

	const paths = postsSlugs.map((slug) => ({
		params: { slug },
	}));

	return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	// const subscriberCount = await getButtondownSubscriberCount();
	// const postsData = await getBlogPostsData();
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	// const post = postsData.find((postData) => postData.slug === params?.slug)!;
	const result = await getBlogPostData(params?.slug);

	console.log({ result });

	return { props: { ...result } };
};

export default Post;
