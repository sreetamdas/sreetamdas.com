import styled from "styled-components";

import { sharedTransition } from "styles/components";

export const BlogPostsPreviewLayout = styled.div`
	display: grid;
	gap: 1rem;
`;

export const Layout = styled.div`
	display: grid;
	grid-template-columns: 1fr min(var(--max-width), calc(100% - 2rem)) 1fr;
	column-gap: 1rem;
	padding: 0;

	& > * {
		grid-column: 2;
	}
`;

export const Center = styled.div`
	display: grid;
	padding: 0;
	justify-items: center;
`;

export const WrapperForFooter = styled.div`
	display: grid;
	grid-template-rows: auto 1fr auto;
	min-height: 100vh;
	align-items: start;

	color: var(--color-primary);
	background-color: var(--color-background);

	${sharedTransition("color, background-color")}
`;

export const Space = styled.div<{ size?: number }>`
	margin: 0;
	padding: ${({ size }) => (size ? `${size / 2}px` : "50px")};
`;

export const FullWidth = styled.div`
	width: 100%;
	grid-column: 1 / -1;
`;
