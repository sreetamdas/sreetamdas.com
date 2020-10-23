import styled, { css } from "styled-components";

export const BlogPostsPreviewLayout = styled.div`
	display: grid;
	grid-gap: 1rem;
`;

export const Layout = styled.div`
	max-width: var(--max-width);
	width: 100%;
	padding: 0 15px;
`;

export const Center = styled.div`
	display: grid;
	padding: 0 20px;
	justify-items: center;
`;

export const MDXText = styled.div`
	margin: 0; /* thanks @mxstbr! */
	padding: 15px 0;
`;

export const RemoveBulletsFromOL = styled.div`
	& ul {
		list-style: none;
		padding-left: 30px;
	}
	& ul li {
		padding: 5px;
	}
`;

export const PaddingListItems = styled.div`
	& ul li {
		padding: 5px;
	}
`;

export const ReallyBigTitle = styled.h1`
	font-size: 8rem;
	line-height: 1;
`;

export const TextGradientCSS = css`
	background: linear-gradient(
		90deg,
		var(--color-primary-accent) 0%,
		var(--color-secondary-accent) 90%
	);

	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
`;
export const TextGradient = styled.span`
	${TextGradientCSS}
`;

export const Heavy = styled.span`
	font-weight: bold;
`;

export const Monospace = styled.span`
	font-family: SFMono-Regular, Consolas, Roboto Mono, Menlo, Monaco,
		Liberation Mono, Lucida FoobarWrapper, monospace;
`;

export const Space = styled.div<{ size?: number }>`
	margin: 0;
	padding: ${({ size }) => (size ? `${size / 2}px` : "50px")};
`;

export const WrapperForFooter = styled.div`
	display: grid;
	grid-template-rows: 1fr auto;
	min-height: 100vh;
	align-items: start;
`;
