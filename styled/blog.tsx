import Link, { LinkProps } from "next/link";
import styled from "styled-components";
import { PropsWithChildren } from "react";

export const BlogPostPreview = ({ post }: { post: TBlogPost }) => {
	return (
		<Link href="/blog/[slug]" as={`/blog/${post.slug}`}>
			<Card>
				<BlogPostPreviewTitle>{post.title}</BlogPostPreviewTitle>
				<Datestamp>
					{new Date(post.publishedAt).toLocaleDateString("en-US", {
						month: "long",
						year: "numeric",
						day: "numeric",
					})}
					{!post.published && <PostNotPublishedWarning />}
				</Datestamp>
				<SmallText>{post.summary}</SmallText>
			</Card>
		</Link>
	);
};

export const BlogPostTitle = styled.h1`
	color: var(--color-primary-accent);
	font-size: 40px;
	margin: 0;
	padding-top: 25px;
	padding-bottom: 5px;
`;

export const BlogPostPreviewTitle = styled.h2`
	color: var(--color-primary-accent);
	margin: 0;
	padding-bottom: 5px;
`;

export const BlogPostMDXContent = styled.div`
	padding: 30px 0;
	line-height: 1.4;
`;

export const Card = styled.div`
	padding: 10px 0;
	cursor: pointer;
	/* background: #ffffff; */
	/* border: 1px solid slategray; */
`;

export const Datestamp = styled.p`
	font-size: 12px;
	padding-bottom: 10px;
	margin: 0; /* thanks @mxstbr! */
`;

export const Title = styled.h1`
	padding-top: 20px;
`;

export const Text = styled.p<{ paddedTop?: boolean }>`
	line-height: 1.4;
	margin: 0; /* thanks @mxstbr! */
	padding: 15px 0;
	padding-top: ${({ paddedTop }) => (paddedTop ? "150px" : null)};
`;

export const SmallText = styled.p`
	font-size: 14px;
	margin: 0; /* thanks @mxstbr! */
	padding-bottom: 10px;
`;

export const StyledLink = styled.a`
	text-decoration: none;
	color: var(--color-primary-accent);
	cursor: pointer;

	&:visited {
		text-decoration: none;
	}

	&:hover {
		text-decoration: underline;
	}
`;

export const WarningSpan = styled.span`
	padding: 5px 15px;
	margin: 0 15px;
	background-color: red;
	color: var(--color-background);
	border-radius: 5px;
`;

export const PostNotPublishedWarning = () => {
	return <WarningSpan>UNPUBLISHED</WarningSpan>;
};

export const ProgressBar = styled.div<{ scroll: number }>`
	position: fixed;
	background: linear-gradient(
		to right,
		var(--color-primary-accent) ${({ scroll }) => scroll}%,
		transparent 0
	);
	width: 100%;
	height: 4px;
	z-index: 3;
`;

export const LinkTo = ({
	children,
	...props
}: PropsWithChildren<LinkProps>) => {
	return (
		<Link {...props}>
			<StyledLink>{children}</StyledLink>
		</Link>
	);
};
