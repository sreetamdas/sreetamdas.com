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
import { TBlogPost } from "typings/blog";
import { useHover } from "utils/hooks";

export const ShareLinks = (post: TBlogPost) => {
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

export const BlogPostPreview = ({ post, slug }: { post: TBlogPost }) => {
	const [hoverRef, isHovered] = useHover();

	return (
		<article>
			<Link href={`/blog/${slug}`} scroll={false} passHref>
				<AnchorUnstyled href={`/blog/${slug}`}>
					<Card ref={hoverRef}>
						<BlogPostPreviewTitle {...{ isHovered }}>{post.title}</BlogPostPreviewTitle>
						<Datestamp>
							{new Date(post.publishedAt).toLocaleDateString("en-US", {
								month: "long",
								year: "numeric",
								day: "numeric",
							})}
							{!post.published && <PostNotPublishedWarning />}
						</Datestamp>
						<SmallText>{post.summary}</SmallText>
						<ReadMorePrompt {...{ isHovered }}>
							Read more {isHovered && <FaArrowRight style={{ fontSize: "12px" }} />}
						</ReadMorePrompt>
					</Card>
				</AnchorUnstyled>
			</Link>
		</article>
	);
};
