import styled, { css } from "styled-components";

export const Typography = styled.h2`
	font-size: 4rem;
	color: var(--color-primary);
	line-height: 0.98;
	font-family: Inter, Roboto;
`;

const RGBWaveMixin = css`
	color: var(--color-fancy-pants);
	transition-property: border, color;
	transition-duration: 5s;
	transition-timing-function: linear;
`;

export const Highlighted = styled.span<{ link?: boolean }>`
	font-size: clamp(4rem, 15vw, 8rem);
	letter-spacing: -0.5rem;
	${RGBWaveMixin}

	${({ link }) =>
		link &&
		css`
			& a {
				${RGBWaveMixin}
			}
		`}
`;
