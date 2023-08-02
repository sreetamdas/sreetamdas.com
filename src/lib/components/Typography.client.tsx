"use client";

import { clsx } from "clsx";
import { random } from "lodash-es";
import { type ReactNode, useEffect } from "react";

import { useInterval } from "@/lib/helpers/hooks";

let root: HTMLElement;

function getNewColor() {
	const h = random(1, 360);
	const s = random(80, 90);
	const l = random(50, 60);

	return `hsl(${h}, ${s}%, ${l}%)`;
}

export const ChameleonHighlight = ({
	className: passedClasses,
	children,
}: {
	className?: string;
	children: ReactNode;
}) => {
	function changeColor() {
		const newColor = getNewColor();

		if (root === undefined) root = document?.documentElement;
		root.style.setProperty("--color-fancy-pants", newColor);
	}

	useInterval(() => {
		changeColor();
	}, 3000);

	useEffect(() => {
		changeColor();
	}, []);

	return (
		<span
			className={clsx(
				"transition-colors duration-[3000ms] ease-linear [color:var(--color-fancy-pants,rgb(var(--color-primary)))]",
				passedClasses
			)}
		>
			{children}
		</span>
	);
};
