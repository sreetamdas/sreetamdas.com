import { GetStaticPaths, GetStaticProps } from "next";
import dynamic from "next/dynamic";
import { Fragment, useRef } from "react";

import { ScrollToTop, ShareLinks } from "components/blog";
import { Newsletter } from "components/blog/Newsletter";
import { ReadingProgress } from "components/blog/ProgressBar";
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

const Post = ({ post }: { post: TBlogPost }) => {
	const MDXPost = dynamic(() => import(`content/blog/${post.slug}.mdx`), {
		loading: () => <div dangerouslySetInnerHTML={{ __html: post.content }} />,
	});
	const topRef = useRef<HTMLDivElement>(null);

	return (
		<Fragment>
			<DocumentHead
				title={post.title}
				imageURL={post?.image}
				description={post.summary}
			/>
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
				<MDXPost />
			</BlogPostMDXContent>
			<EndLinks>
				<ShareLinks {...post} />
				<ScrollToTop topRef={topRef} />
			</EndLinks>
			<Newsletter />
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

export const getStaticProps: GetStaticProps = async ({ params }) => {
	if (!params) return { props: {} };
	const postsData = await getBlogPostsData();
	const post = postsData.find((postData) => postData.slug === params.slug)!;

	return { props: { post } };
};

export default Post;
