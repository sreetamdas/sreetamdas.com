import Link, { LinkProps } from "next/link";
import styled from "styled-components";
import { PropsWithChildren } from "react";
import { TextGradient } from "components/styled/Layouts";

export const BlogPostPreview = ({ post }: { post: TBlogPost }) => (
	<Link href="/blog/[slug]" as={`/blog/${post.slug}`}>
		<StyledLink href={`/blog/${post.slug}`}>
			<Card>
				<BlogPostPreviewTitle>
					<TextGradient>{post.title}</TextGradient>
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
			</Card>
		</StyledLink>
	</Link>
);

export const BlogPostTitle = styled.h1`
	/* color: var(--color-primary-accent); */
	font-size: 3rem;
	margin: 0;
	padding-top: 30px;
	padding-bottom: 5px;
`;

export const BlogPostPreviewTitle = styled.h2`
	/* color: var(--color-primary-accent); */
	margin: 0;
	padding-bottom: 5px;
	font-size: 2rem;
`;

export const BlogPostMDXContent = styled.div`
	padding: 30px 0;
	line-height: 1.4;
`;

export const Card = styled.div`
	padding: 10px 0;
	cursor: pointer;
`;

export const Datestamp = styled.p`
	color: var(--color-primary-accent);
	font-size: 11px;
	padding: 10px 0;
	margin: 0; /* thanks @mxstbr! */
	/* opacity: 0.6; */
`;

export const Title = styled.h1`
	padding: 20px 0;
	font-size: 2rem;
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
	cursor: pointer;
	color: var(--color-primary);

	&:visited {
		text-decoration: none;
	}
	&:hover {
		text-decoration: none;
	}
`;

export const StyledAccentLink = styled(StyledLink)`
	color: var(--color-primary-accent);
`;

export const WarningSpan = styled.span`
	padding: 5px 10px;
	margin: 0 15px;
	background-color: red;
	color: white;
	border-radius: 5px;
`;

export const PostNotPublishedWarning = () => {
	return <WarningSpan>UNPUBLISHED</WarningSpan>;
};

export const ProgressBar = styled.div<{ scroll: number }>`
	position: fixed;
	left: 0;
	background: linear-gradient(
		90deg,
		var(--color-primary-accent) 0%,
		var(--color-secondary-accent) 100%
	);
	width: ${({ scroll }) => scroll}%;
	height: 8px;
	transition: 0.2s ease;
	z-index: 3;
`;

export const LinkTo = ({
	children,
	style = {},
	...props
}: PropsWithChildren<LinkProps & { style?: React.CSSProperties }>) => {
	return (
		<Link {...props} passHref>
			<StyledAccentLink {...{ style }}>{children}</StyledAccentLink>
		</Link>
	);
};

export const PostMetaDataGrid = styled.div`
	display: grid;
	grid-auto-flow: column;
	grid-gap: 0.5rem;
	justify-content: start;
	align-items: center;
`;

export const RoundedImageSmall = styled.img`
	height: 25px;
	border-radius: 50%;
`;
