import Link from "next/link";
import React from "react";
import { FaArrowRight, FaTwitter } from "react-icons/fa";

import {
	Card,
	IconContainer,
	PostNotPublishedWarning,
	ReadMorePrompt,
} from "styles/blog";
import { BlogPostPreviewTitle, Datestamp, SmallText } from "styles/typography";
import { useHover } from "utils/hooks";

export const ShareLinks = (post: TBlogPost) => {
	const tweetShareURL = `https://twitter.com/intent/tweet?text=Check out: ${post.title}&url=${process.env.SITE_URL}/blog/${post.slug}%0D%0A&via=_SreetamDas`;

	return (
		<IconContainer
			href={tweetShareURL}
			target="_blank"
			rel="noopener noreferrer"
		>
			<FaTwitter aria-label="Share on Twitter" />
		</IconContainer>
	);
};

export const BlogPostPreview = ({ post }: { post: TBlogPost }) => {
	const [hoverRef, isHovered] = useHover();

	return (
		<Link href={`/blog/${post.slug}`} scroll={false}>
			<Card ref={hoverRef}>
				<BlogPostPreviewTitle {...{ isHovered }}>
					{post.title}
				</BlogPostPreviewTitle>
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
					Read more{" "}
					{isHovered && <FaArrowRight style={{ fontSize: "12px" }} />}
				</ReadMorePrompt>
			</Card>
		</Link>
	);
};
