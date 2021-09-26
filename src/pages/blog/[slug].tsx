import { getMDXComponent } from "mdx-bundler/client";
import { GetStaticPaths, GetStaticProps } from "next";
import React, { Fragment, useMemo, useRef } from "react";

import { ChromaHighlight } from "components/FancyPants";
import { ViewsCounter } from "components/ViewsCounter";
import { ScrollToTop, ShareLinks } from "components/blog";
import { Newsletter } from "components/blog/Newsletter";
import { ReadingProgress } from "components/blog/ProgressBar";
import { HighlightWithUseEffect, HighlightWithUseInterval } from "components/blog/rgb-text";
import { MDXComponents, MDXWrapper } from "components/mdx";
import { DocumentHead } from "components/shared/seo";
import {
	BlogPostMDXContent,
	PostNotPublishedWarning,
	PostMetaDataGrid,
	EndLinks,
	Highlight,
	CustomBlockquote,
} from "styles/blog";
import { MDXLink, MDXTitle } from "styles/components";
import { Sparkles } from "styles/special";
import {
	BlogPostTitle,
	Datestamp,
	TextGradient,
	Heavy,
	StyledAccentTextLink,
} from "styles/typography";
import { TBlogPostPageProps } from "typings/blog";
import { getMDXFileData, getBlogPostsSlugs } from "utils/blog";
import { getButtondownSubscriberCount } from "utils/misc";

type TProps = TBlogPostPageProps & {
	subscriberCount: number;
};
const Post = ({ code, frontmatter, slug, subscriberCount }: TProps) => {
	const topRef = useRef<HTMLDivElement>(null);
	const Component = useMemo(() => getMDXComponent(code), [code]);

	return (
		<Fragment>
			<DocumentHead
				title={frontmatter.title}
				imageURL={frontmatter?.image}
				description={frontmatter.summary}
			/>
			<ReadingProgress />
			<div ref={topRef} />
			<BlogPostTitle>
				<TextGradient>{frontmatter.title}</TextGradient>
			</BlogPostTitle>
			<BlogPostMDXContent>
				<MDXWrapper>
					<Component
						// @ts-expect-error ugh, MDX
						components={{
							MDXLink,
							MDXTitle,
							Sparkles,
							ChromaHighlight,
							HighlightWithUseEffect,
							HighlightWithUseInterval,
							Highlight,
							CustomBlockquote,
							TextGradient,
							Heavy,
							StyledAccentTextLink,
							...MDXComponents,
						}}
					/>
				</MDXWrapper>
			</BlogPostMDXContent>
			<EndLinks>
				<ShareLinks title={frontmatter.title} slug={slug} />
				<ScrollToTop topRef={topRef} />
			</EndLinks>
			<PostMetaDataGrid>
				<Datestamp>
					Published:{" "}
					{new Date(frontmatter.publishedAt).toLocaleDateString("en-US", {
						month: "long",
						year: "numeric",
						day: "numeric",
					})}
					{!frontmatter.published && <PostNotPublishedWarning />}
				</Datestamp>
			</PostMetaDataGrid>
			<ViewsCounter pageType="post" />
			<Newsletter {...{ subscriberCount }} />
		</Fragment>
	);
};

export const getStaticPaths: GetStaticPaths = async () => {
	const postsSlugs = await getBlogPostsSlugs();

	const paths = postsSlugs.map((slug) => ({
		params: { slug },
	}));

	return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const subscriberCount = await getButtondownSubscriberCount();
	if (typeof params?.slug === "undefined" || Array.isArray(params?.slug)) {
		return {
			props: {
				subscriberCount,
			},
		};
	}
	const result = await getMDXFileData(params?.slug, { cwd: "content/blog" });

	return { props: { ...result, subscriberCount } };
};

export default Post;
