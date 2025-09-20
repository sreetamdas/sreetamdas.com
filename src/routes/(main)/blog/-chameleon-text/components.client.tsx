"use client";

import { random } from "lodash-es";
import { type PropsWithChildren, useEffect } from "react";

import { ChameleonHighlight } from "@/lib/components/Typography.client";
import { useInterval } from "@/lib/helpers/hooks";

let root: HTMLElement;

function getNewColor() {
	const h = random(1, 360);
	const s = random(80, 90);
	const l = random(50, 60);

	return `hsl(${h}, ${s}%, ${l}%)`;
}
function changeColor() {
	const newColor = getNewColor();

	if (root === undefined) root = document?.documentElement;
	root.style.setProperty("--color-fancy-pants", newColor);
}

export const HighlightWithUseEffect = ({
	children,
	...props
}: PropsWithChildren<{ link?: boolean }>) => {
	useEffect(() => {
		changeColor();
	}, []);

	return <ChameleonHighlight {...props}>{children}</ChameleonHighlight>;
};

export const HighlightWithUseInterval = ({
	children,
	...props
}: PropsWithChildren<{ link?: boolean }>) => {
	useEffect(() => {
		changeColor();
	}, []);

	useInterval(() => {
		changeColor();
	}, 3000);

	return <ChameleonHighlight {...props}>{children}</ChameleonHighlight>;
};
