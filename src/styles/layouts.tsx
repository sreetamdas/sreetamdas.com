import styled from "styled-components";

export const BlogPostsPreviewLayout = styled.div`
	display: grid;
	grid-gap: 1rem;
`;

export const Layout = styled.div`
	max-width: var(--max-width);
	width: 100%;
	padding: 0;
`;

export const Center = styled.div`
	display: grid;
	padding: 0;
	justify-items: center;
`;

export const WrapperForFooter = styled.div`
	display: grid;
	grid-template-rows: 1fr auto;
	min-height: 100vh;
	align-items: start;
`;

export const Space = styled.div<{ size?: number }>`
	margin: 0;
	padding: ${({ size }) => (size ? `${size / 2}px` : "50px")};
`;
