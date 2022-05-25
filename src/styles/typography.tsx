import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes, forwardRef, PropsWithChildren } from "react";
import styled, { css } from "styled-components";

import { breakpoint, focusVisible, pixelToRem } from "@/utils/style";

export const ReallyBigTitle = styled.h1`
	font-size: 8rem;
	line-height: 1;
`;

export const primaryGradientMixin = css`
	background-image: linear-gradient(
		90deg,
		var(--color-primary-accent) 0%,
		var(--color-secondary-accent) 100%
	);

	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	box-decoration-break: slice;
`;

export const PrimaryGradient = styled.span`
	${primaryGradientMixin}
`;

export const Heavy = styled.span`
	font-weight: bold;
`;

export const Accent = styled.span`
	color: var(--color-primary-accent);
`;

export const Monospace = styled.span`
	font-family: var(--font-family-code);
`;

export const MDXText = styled.div`
	margin: 0; /* thanks @mxstbr! */
	padding: 15px 0;
`;

export const Datestamp = styled.p`
	color: var(--color-primary-accent);
	font-weight: bold;
	font-style: italic;
	font-size: 1rem;
	padding: 5px 0;
	margin: 0.5rem 0;
`;

type TitleProps = {
	$resetLineHeight?: boolean;
	$size?: number;
	$scaled?: boolean;
};
export const Title = styled.h1<TitleProps>`
	padding: 20px 0;

	${({ $resetLineHeight }) =>
		$resetLineHeight &&
		css`
			line-height: 1;
		`}

	${({ $size = 3 }) =>
		css`
			font-size: ${$size}rem;
		`}
	${({ $scaled, $size }) =>
		$scaled &&
		breakpoint.until.sm(css`
			font-size: clamp(1rem, ${$size}rem, 15vw);
		`)}
`;

export const MDXTitle = styled.h1<{ color?: string }>`
	font-size: 2rem;
	color: ${({ color }) => (color ? color : "red")};
`;

export const Paragraph = styled.p<{ paddingTop?: boolean | number }>`
	margin: 0;
	padding: 10px 0;
	padding-top: ${({ paddingTop }) =>
		paddingTop ? (typeof paddingTop === "number" ? `${paddingTop}px` : "150px") : null};
`;

export const SmallText = styled.p`
	font-size: ${pixelToRem(14)};
	margin: 0;
	padding-bottom: 10px;
`;

export const BlogPostTitle = styled.h1`
	font-size: clamp(4rem, 15vw, 6rem);
	line-height: 1.1;
	margin: 0;
	padding-top: 30px;
	padding-bottom: 15px;
`;

export const LinkUnstyled = styled.a`
	text-decoration: none;

	&:visited {
		text-decoration: none;
	}
`;

type StyledLinkProps = {
	$primary?: boolean;
	external?: boolean;
	$unstyledOnHover?: boolean;
};
export const StyledLink = styled.a<StyledLinkProps>`
	text-decoration: none;

	${({ $primary }) =>
		$primary
			? css`
					color: var(--color-primary);
					&:hover {
						color: var(--color-primary-accent);
					}
			  `
			: css`
					color: var(--color-primary-accent);
			  `}

	:visited {
		text-decoration: none;
	}

	${focusVisible(css`
		outline: 2px dashed var(--color-secondary-accent) !important;
		outline-offset: 2px;
	`)}

	${({ $unstyledOnHover }) =>
		$unstyledOnHover
			? css`
					:hover {
						text-decoration: none;
					}
			  `
			: css`
					:hover {
						text-decoration-color: currentColor;
						text-decoration-line: underline;
						text-decoration-style: solid;
						text-decoration-thickness: 2px;
					}
			  `}
`;

export const ExternalLink = styled(StyledLink).attrs({
	target: "_blank",
})``;

export const StyledAccentTextLink = styled(StyledLink)`
	:visited {
		text-decoration: none;
	}
	:hover {
		text-decoration: underline;
	}
`;

export type LinkToProps = PropsWithChildren<LinkProps> &
	AnchorHTMLAttributes<never> &
	StyledLinkProps;
export const LinkTo = forwardRef<HTMLAnchorElement, LinkToProps>(function LinkTo(
	{ children, ...allProps },
	ref
) {
	const { href, as, passHref, prefetch, replace, scroll, shallow, locale, ...linkProps } = allProps;
	const { external } = linkProps;

	if (external) {
		linkProps.target = "_blank";
	}

	return (
		<Link
			{...{
				href,
				as,
				passHref,
				prefetch,
				replace,
				scroll,
				shallow,
				locale,
			}}
			passHref
		>
			<StyledLink {...linkProps} ref={ref}>
				{children}
			</StyledLink>
		</Link>
	);
});
