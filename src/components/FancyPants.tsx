import { PropsWithChildren } from "react";
import styled, { css } from "styled-components";

import { LinkTo } from "styles/typography";
import { random, useInterval, useTimeout } from "utils/hooks";

let root: HTMLElement;

const getNewColor = () => {
	const h = random(1, 360);
	const s = random(80, 90);
	const l = random(50, 60);

	return `hsl(${h}, ${s}%, ${l}%)`;
};
export const ChromaHighlight = ({
	children,
	link,
}: PropsWithChildren<{ link?: boolean }>) => {
	const changeColor = () => {
		const newColor = getNewColor();

		if (root === undefined) root = document?.documentElement;
		root.style.setProperty("--color-fancy-pants", newColor);
	};

	useInterval(() => {
		changeColor();
	}, 5000);

	// HACK: begin the color transition, adding it in useMount doesn't set off the CSS transition
	useTimeout(() => {
		changeColor();
	}, 0);

	return <Highlighted {...{ link }}>{children}</Highlighted>;
};

export const Typography = styled.h2`
	font-size: clamp(3rem, 5vw, 5vw);
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
	letter-spacing: -0.3rem;
	${RGBWaveMixin}

	${({ link }) =>
		link &&
		css`
			& a {
				${RGBWaveMixin}
				border-bottom: unset;

				&:hover {
					color: var(--color-fancy-pants);
					text-decoration: underline;
				}
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
