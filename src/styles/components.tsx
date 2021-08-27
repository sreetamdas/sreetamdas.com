import Link from "next/link";
import styled, { css } from "styled-components";

export const StyledSummary = styled.summary`
	cursor: pointer;
	padding-bottom: 1rem;
`;

export const StyledDetails = styled.details`
	&[open] > ${StyledSummary} {
		color: var(--color-primary-accent);
	}
`;
export const StyledDetailAnswer = styled.div``;

export const sharedTransition = css`
	transition-duration: var(--transition-duration);
	transition-property: color, background-color;
	transition-timing-function: linear;
`;

export const MDXTitle = styled.h1<{ color?: string }>`
	font-size: 2rem;
	color: ${({ color }) => (color ? color : "red")};
`;

export const MDXLink = styled(Link)`
	color: var(--color-primary-accent);
	text-decoration: none;
	&:hover {
		color: var(--color-primary-accent);
	}
`;
