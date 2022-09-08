import { getMDXComponent } from "mdx-bundler/client";
import { GetStaticProps } from "next";
import { useMemo, useRef } from "react";

import { ChromaHighlight } from "@/components/FancyPants";
import { NewsletterSignup } from "@/components/Newsletter/Signup";
import { ViewsCounter } from "@/components/ViewsCounter";
import { ScrollToTop, ShareLinks } from "@/components/blog";
import { ReadingProgress } from "@/components/blog/ProgressBar";
import { HighlightWithUseEffect, HighlightWithUseInterval } from "@/components/blog/rgb-text";
import { MDXComponents } from "@/components/mdx";
import { DocumentHead } from "@/components/shared/seo";
import { getButtondownSubscriberCount } from "@/domains/Buttondown";
import {
	BlogPostContentWrapper,
	PostNotPublishedWarning,
	PostMetaDataGrid,
	EndLinks,
	Highlight,
	CustomBlockquote,
} from "@/styles/blog";
import { MDXLink, MDXTitle } from "@/styles/components";
import { Sparkles } from "@/styles/special";
import {
	BlogPostTitle,
	Datestamp,
	PrimaryGradient,
	Heavy,
	StyledAccentTextLink,
} from "@/styles/typography";
import { MDXBundledResultProps } from "@/typings/blog";
import { getMDXFileData, getBlogPostsSlugs } from "@/utils/blog";
type Props = MDXBundledResultProps & {
	subscriberCount: number;
};
const Post = ({ code, frontmatter, slug, subscriberCount }: Props) => {
	const topRef = useRef<HTMLDivElement>(null);
	const Component = useMemo(() => getMDXComponent(code), [code]);

	return (
		<>
			<DocumentHead
				title={frontmatter.seoTitle ?? frontmatter.title}
				imageURL={frontmatter?.image}
				description={frontmatter.summary}
			/>
			<ReadingProgress />
			<div ref={topRef} />
			<BlogPostTitle>
				<PrimaryGradient>{frontmatter.title}</PrimaryGradient>
			</BlogPostTitle>
			<BlogPostContentWrapper>
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
						TextGradient: PrimaryGradient,
						Heavy,
						StyledAccentTextLink,
						...MDXComponents,
					}}
				/>
			</BlogPostContentWrapper>
			<EndLinks>
				<ShareLinks title={frontmatter.title} slug={slug} />
				<ScrollToTop topRef={topRef} />
			</EndLinks>
			<PostMetaDataGrid>
				<Datestamp>
					Last updated:{" "}
					{new Date(frontmatter.updatedAt ?? frontmatter.publishedAt).toLocaleDateString("en-US", {
						month: "long",
						year: "numeric",
						day: "numeric",
					})}
					{!frontmatter.published && <PostNotPublishedWarning />}
				</Datestamp>
			</PostMetaDataGrid>
			<ViewsCounter pageType="post" />
			<NewsletterSignup {...{ subscriberCount }} />
		</>
	);
};

export async function getStaticPaths() {
	const postsSlugs = await getBlogPostsSlugs();

	const paths = postsSlugs.map((slug) => ({
		params: { slug },
	}));

	return { paths, fallback: false };
}

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
