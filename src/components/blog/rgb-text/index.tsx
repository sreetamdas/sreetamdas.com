import { PropsWithChildren, useEffect } from "react";
import styled, { css } from "styled-components";

import { random, useInterval } from "@/utils/hooks";

let root: HTMLElement;

const getNewColor = () => {
	const h = random(1, 360);
	const s = random(80, 90);
	const l = random(50, 60);

	return `hsl(${h}, ${s}%, ${l}%)`;
};
export const HighlightWithUseEffect = ({
	children,
	link,
}: PropsWithChildren<{ link?: boolean }>) => {
	const changeColor = () => {
		const newColor = getNewColor();

		if (root === undefined) root = document?.documentElement;
		root.style.setProperty("--color-chameleon-use-effect", newColor);
	};

	useEffect(() => {
		changeColor();
	}, []);

	return (
		<Highlighted {...{ link }} color={"use-effect"}>
			{children}
		</Highlighted>
	);
};

export const HighlightWithUseInterval = ({
	children,
	link,
}: PropsWithChildren<{ link?: boolean }>) => {
	const changeColor = () => {
		const newColor = getNewColor();

		if (root === undefined) root = document?.documentElement;
		root.style.setProperty("--color-chameleon-use-interval", newColor);
	};

	useEffect(() => {
		changeColor();
	}, []);

	useInterval(() => {
		changeColor();
	}, 5000);

	return (
		<Highlighted {...{ link }} color={"use-interval"}>
			{children}
		</Highlighted>
	);
};

const WaveMixin = css`
	transition-property: border, color;
	transition-duration: 5s;
	transition-timing-function: linear;
`;

const Highlighted = styled.span<{ color?: string }>`
	font-size: clamp(4rem, 15vw, 6rem);
	letter-spacing: -0.3rem;
	${WaveMixin}

	color: ${({ color }) => `var(--color-chameleon-${color}, var(--color-primary-accent))`}
`;
