import styled, { css } from "styled-components";

import { LinkTo } from "styles/typography";

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
	font-size: clamp(4rem, 10vw, 10vw);
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

export const NavigationContainer = styled.div`
	position: absolute;
	right: 0;
	padding: 1rem;

	display: grid;
	grid-auto-flow: column;
	grid-template-columns: repeat(auto-fill, minmax(min-content, 1fr));
	grid-column-gap: 1rem;

	font-weight: 900;
	font-size: 1.5rem;
`;

export const NavLink = styled(LinkTo)`
	border: none;
`;
