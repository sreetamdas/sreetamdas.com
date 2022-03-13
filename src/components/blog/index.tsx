import Link from "next/link";
import React, { RefObject } from "react";
import { FaArrowRight, FaLongArrowAltUp, FaTwitter } from "react-icons/fa";

import { ButtonUnstyled } from "@/components/Button/styles";
import { SITE_URL } from "@/config";
import {
	AnchorUnstyled,
	Card,
	IconContainer,
	PostNotPublishedWarning,
	ReadMorePrompt,
} from "@/styles/blog";
import { BlogPostPreviewTitle, Datestamp, SmallText } from "@/styles/typography";
import { TBlogPostFrontmatter, TBlogPostPageProps } from "@/typings/blog";
import { useHover } from "@/utils/hooks";

type TShareLinksProps = Pick<TBlogPostPageProps, "slug"> & Pick<TBlogPostFrontmatter, "title">;
export const ShareLinks = ({ title, slug }: TShareLinksProps) => {
	const tweetShareURL = `https://twitter.com/intent/tweet?text=Check out: ${title}&url=${SITE_URL}/blog/${slug}%0D%0A&via=_SreetamDas`;

	return (
		<IconContainer href={tweetShareURL} target="_blank" rel="noopener noreferrer">
			<FaTwitter aria-label="Share on Twitter" />
			<span>Share via Twitter</span>
		</IconContainer>
	);
};

export const ScrollToTop = ({ topRef }: { topRef: RefObject<HTMLDivElement> }) => {
	function scrollToTop() {
		if (topRef) topRef.current?.scrollIntoView({ behavior: "smooth" });
	}
	return (
		<ButtonUnstyled onClick={scrollToTop}>
			<FaLongArrowAltUp style={{ fontSize: "20px" }} />
			Back to the top
		</ButtonUnstyled>
	);
};

type TBlogPostPreviewProps = Pick<TBlogPostPageProps, "frontmatter" | "slug">;
export const BlogPostPreview = ({ frontmatter, slug }: TBlogPostPreviewProps) => {
	const [hoverRef, isHovered] = useHover();

	return (
		<article>
			<Link href={`/blog/${slug}`} scroll={false} passHref>
				<AnchorUnstyled href={`/blog/${slug}`}>
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
