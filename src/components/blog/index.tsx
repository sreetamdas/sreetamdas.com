import Link from "next/link";
import React, { RefObject } from "react";
import { FaArrowRight, FaLongArrowAltUp, FaTwitter } from "react-icons/fa";

import {
	AnchorUnstyled,
	ButtonUnstyled,
	Card,
	IconContainer,
	PostNotPublishedWarning,
	ReadMorePrompt,
} from "styles/blog";
import { BlogPostPreviewTitle, Datestamp, SmallText } from "styles/typography";
import { TBlogPostFrontmatter } from "typings/blog";
import { useHover } from "utils/hooks";

export const ShareLinks = (post: TBlogPostFrontmatter) => {
	const tweetShareURL = `https://twitter.com/intent/tweet?text=Check out: ${post.title}&url=${process.env.SITE_URL}/blog/${post.slug}%0D%0A&via=_SreetamDas`;

	return (
		<IconContainer href={tweetShareURL} target="_blank" rel="noopener noreferrer">
			<FaTwitter aria-label="Share on Twitter" />
			<span>Share via Twitter</span>
		</IconContainer>
	);
};

export const ScrollToTop = ({ topRef }: { topRef: RefObject<HTMLDivElement> }) => {
	const scrollToTop = () => {
		if (topRef) topRef.current?.scrollIntoView({ behavior: "smooth" });
	};
	return (
		<ButtonUnstyled onClick={scrollToTop}>
			<FaLongArrowAltUp style={{ fontSize: "20px" }} />
			Back to the top
		</ButtonUnstyled>
	);
};

type TBlogPostPreviewProps = {
	frontmatter: TBlogPostFrontmatter;
};
export const BlogPostPreview = ({ frontmatter }: TBlogPostPreviewProps) => {
	const [hoverRef, isHovered] = useHover();

	return (
		<article>
			<Link href={`/blog/${frontmatter.slug}`} scroll={false} passHref>
				<AnchorUnstyled href={`/blog/${frontmatter.slug}`}>
					<Card ref={hoverRef}>
						<BlogPostPreviewTitle {...{ isHovered }}>{frontmatter.title}</BlogPostPreviewTitle>
						<Datestamp>
							{new Date(frontmatter.publishedAt).toLocaleDateString("en-US", {
								month: "long",
								year: "numeric",
								day: "numeric",
							})}
							{!frontmatter.published && <PostNotPublishedWarning />}
						</Datestamp>
						<SmallText>{frontmatter.summary}</SmallText>
						<ReadMorePrompt {...{ isHovered }}>
							Read more {isHovered && <FaArrowRight style={{ fontSize: "12px" }} />}
						</ReadMorePrompt>
					</Card>
				</AnchorUnstyled>
			</Link>
		</article>
	);
};
