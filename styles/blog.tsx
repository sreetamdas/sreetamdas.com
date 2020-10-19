import Link, { LinkProps } from "next/link";
import { forwardRef, PropsWithChildren, PropsWithoutRef, Ref } from "react";
import { FaArrowRight } from "react-icons/fa";
import styled, { StyledComponentPropsWithRef, css } from "styled-components";

import { PaddingListItems, TextGradientCSS } from "styles/layouts";
import { useHover } from "utils/hooks";

export const BlogPostPreview = ({ post }: { post: TBlogPost }) => {
	const [hoverRef, isHovered] = useHover();

	return (
		<Link href="/blog/[slug]" as={`/blog/${post.slug}`} scroll={false}>
			<StyledLink href={`/blog/${post.slug}`}>
				<Card ref={hoverRef}>
					<BlogPostPreviewTitle>{post.title}</BlogPostPreviewTitle>
					<Datestamp>
						{new Date(post.publishedAt).toLocaleDateString(
							"en-US",
							{
								month: "long",
								year: "numeric",
								day: "numeric",
							}
						)}
						{!post.published && <PostNotPublishedWarning />}
					</Datestamp>
					<SmallText>{post.summary}</SmallText>
					<ReadMorePrompt {...{ isHovered }}>
						Read more{" "}
						{isHovered && (
							<FaArrowRight style={{ fontSize: "12px" }} />
						)}
					</ReadMorePrompt>
				</Card>
			</StyledLink>
		</Link>
	);
};

export const BlogPostTitle = styled.h1`
	/* color: var(--color-primary-accent); */
	font-size: 3rem;
	margin: 0;
	padding-top: 30px;
	padding-bottom: 15px;
`;

export const BlogPostPreviewTitle = styled.h2`
	margin: 0;
	padding: 5px 0;
	font-size: 2rem;
	${TextGradientCSS}
`;

export const removeListStyleMixin = css`
	& ul {
		list-style: none;
		padding-left: 30px;
	}
`;

export const BlogPostMDXContent = styled(PaddingListItems)`
	padding: 30px 0;
	line-height: 1.6;
`;

export const Card = styled.div`
	padding: 10px 0;
	cursor: pointer;
`;

export const Datestamp = styled.p`
	color: var(--color-primary-accent);
	font-size: 12px;
	padding: 5px 0;
	margin: 0;
`;

export const Title = styled.h1`
	padding: 20px 0;
	font-size: 3rem;
`;

export const Text = styled.p<{ paddingTop?: boolean | number }>`
	line-height: 1.6;
	margin: 0;
	padding: 10px 0;
	padding-top: ${({ paddingTop }) =>
		paddingTop
			? typeof paddingTop === "number"
				? `${paddingTop}px`
				: "150px"
			: null};
`;

export const SmallText = styled.p`
	font-size: 14px;
	margin: 0;
	padding-bottom: 10px;
	line-height: 1.6;
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

type TStyledLinkProps = PropsWithoutRef<
	StyledComponentPropsWithRef<typeof StyledLink>
>;
export const StyledAccentLink = forwardRef(
	(
		{ style, href, onClick, children, ...props }: TStyledLinkProps,
		ref: Ref<HTMLAnchorElement>
	) => (
		<StyledLink
			{...{ href, onClick, ref, ...props }}
			style={
				Object.keys(style ?? {}).length
					? style
					: { color: "var(--color-primary-accent)" }
			}
		>
			{children}
		</StyledLink>
	)
);

export const StyledAccentTextLink = styled(StyledAccentLink)`
	&:visited {
		text-decoration: none;
	}
	&:hover {
		text-decoration: underline;
	}
`;

export const WarningSpan = styled.span`
	padding: 5px 10px;
	margin: 0 15px;
	background-color: red;
	color: white;
	border-radius: var(--border-radius);
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
	height: 5px;
	transition: 0.2s ease;
	z-index: 3;
`;

export const LinkTo = ({
	children,
	href,
	as,
	replace,
	style = {},
	...props
}: PropsWithoutRef<LinkProps & React.HTMLProps<HTMLAnchorElement>>) => {
	return (
		<Link {...{ href }} passHref>
			<StyledAccentLink {...{ style, ...props }}>
				{children}
			</StyledAccentLink>
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

export const StyledPre = styled.pre`
	background-color: var(--color-inlineCode-bg);
	color: var(--color-inlineCode-fg);
	margin: 0;
	padding: 15px;
	border-radius: var(--border-radius);
	font-size: 14px;
`;

export const IconContainer = styled.a`
	color: var(--color-primary-accent);
	font-size: 25px;
`;

export const LinkedHeaderIconWrapper = styled.a<{ isHovered: boolean }>`
	color: var(--color-primary-accent);
	position: absolute;
	transform: translateX(-125%) translateY(0.2rem);
	font-size: inherit;

	opacity: ${({ isHovered }) => (isHovered ? 0.75 : 0)};
	transition: opacity 200ms ease;
`;

export const NextIconLink = ({
	children,
	href,
}: PropsWithChildren<{ href: string }>) => {
	return (
		<Link href={href} passHref>
			<IconContainer href={href} tabIndex={0}>
				{children}
			</IconContainer>
		</Link>
	);
};

export const CustomBlockquote = styled.aside<{ type?: string }>`
	padding: 20px;
	border-radius: var(--border-radius);

	${({ type }) =>
		type
			? `
				background-color: var(--color-${type}-accent-faded);
				border-left: 0.3em var(--color-${type}-accent) solid;
			  `
			: css`
					background-color: var(--color-info-accent-faded);
					border-left: 0.3em var(--color-info-accent) solid;
			  `}
`;

export const Highlight = styled.span`
	color: var(--color-primary-accent);
	font-style: italic;
	font-weight: bold;
`;

export const ReadMorePrompt = styled.p<{ isHovered: boolean }>`
	font-weight: bold;
	font-size: 14px;
	margin: 0;
	color: ${({ isHovered }) =>
		isHovered ? "var(--color-primary-accent)" : null};
`;
