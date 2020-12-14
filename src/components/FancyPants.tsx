import styled, { css } from "styled-components";

export const Typography = styled.h2`
	font-size: 4rem;
	color: var(--color-primary);
	line-height: 0.9;
`;

export const Highlighted = styled.span<{ link?: boolean }>`
	font-size: clamp(4rem, 15vw, 8rem);
	color: var(--color-fancy-pants);
	letter-spacing: -0.3rem;
	transition-property: border, color;
	transition-duration: 10s;
	transition-timing-function: linear;

	:hover {
		text-decoration: none;
	}

	/* ${({ link }) =>
		link &&
		css`
			border-bottom: 0.4rem solid var(--color-fancy-pants);
		`} */
`;
