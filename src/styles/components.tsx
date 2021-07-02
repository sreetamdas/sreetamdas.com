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
