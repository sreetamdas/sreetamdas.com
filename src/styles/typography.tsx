import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes, forwardRef, PropsWithChildren } from "react";
import { ImArrowUpRight2 } from "react-icons/im";
import styled, { css } from "styled-components";

import { SROnly } from "@/domains/style/helpers";
import { breakpoint, pixelToRem } from "@/utils/style";

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

	::selection {
		background: rgba(var(--values-secondary-accent), 0.99);
		color: var(--color-background);

		background-image: unset;
		background-clip: initial;
		-webkit-background-clip: initial;
		-webkit-text-fill-color: initial;
		box-decoration-break: initial;
	}
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
	$codeFont?: boolean;
	$padding?: string | number;
};
export const Title = styled.h1<TitleProps>`
	${({ $padding }) =>
		$padding
			? css`
					padding: ${$padding};
			  `
			: css`
					padding: 20px 0;
			  `}

	${({ $resetLineHeight }) =>
		$resetLineHeight &&
		css`
			line-height: 1;
		`}

	${({ $size = 3 }) =>
		css`
			font-size: ${$size}rem;
		`};

	${({ $scaled, $size }) =>
		$scaled &&
		breakpoint.until.sm(css`
			font-size: clamp(1rem, ${$size}rem, 15vw);
		`)};

	${({ $codeFont }) =>
		$codeFont &&
		css`
			font-family: var(--font-family-code);
		`}
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

export const UnstyledLink = styled.a`
	text-decoration: none;

	:visited {
		text-decoration: none;
	}
`;

const ExternalLinkIndicator = styled(ImArrowUpRight2)`
	color: var(--color-secondary-accent);
`;

type StyledLinkProps = {
	$primary?: boolean;
	$unstyledOnHover?: boolean;
};
export const StyledLinkBase = styled(UnstyledLink)<StyledLinkProps>`
	position: relative;

	${ExternalLinkIndicator} {
		margin-left: -2px;
	}

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

export const StyledAccentTextLink = styled(StyledLinkBase)`
	:visited {
		text-decoration: none;
	}
	:hover {
		text-decoration: underline;
	}
`;

export type LinkToProps = PropsWithChildren<LinkProps> &
	AnchorHTMLAttributes<HTMLAnchorElement> &
	StyledLinkProps & {
		showExternalLinkIndicator?: boolean;
	};
export const LinkTo = forwardRef<HTMLAnchorElement, LinkToProps>(function LinkTo(
	{ children, ...allProps },
	ref
) {
	const {
		href,
		as,
		passHref,
		prefetch,
		replace,
		scroll,
		shallow,
		locale,
		showExternalLinkIndicator = false,
		...linkProps
	} = allProps;
	const isExternal = linkProps.target === "_blank";

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
			legacyBehavior
		>
			<StyledLinkBase {...linkProps} ref={ref}>
				{children}
				{isExternal && showExternalLinkIndicator && (
					<>
						{" "}
						<SROnly>(opens in a new tab)</SROnly>
						<ExternalLinkIndicator />
					</>
				)}
			</StyledLinkBase>
		</Link>
	);
});
