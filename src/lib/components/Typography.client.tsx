"use client";

import { random } from "lodash-es";
import {
	type HTMLAttributes,
	type PropsWithChildren,
	type ReactNode,
	useEffect,
	useState,
} from "react";

import { useInterval, usePrefersReducedMotion, useRandomInterval } from "@/lib/helpers/hooks";
import { cn } from "@/lib/helpers/utils";

export * from "./Typography";

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

export const ChameleonHighlight = ({
	className: passedClasses,
	children,
}: {
	className?: string;
	children: ReactNode;
}) => {
	useInterval(() => {
		changeColor();
	}, 3000);

	useEffect(() => {
		changeColor();
	}, []);

	return (
		<span
			className={cn(
				"transition-colors duration-[3000ms] ease-linear [color:var(--color-fancy-pants,rgb(var(--color-primary)))]",
				passedClasses,
			)}
		>
			{children}
		</span>
	);
};

type Sparkle = {
	id: string;
	createdAt: number;
	color: string;
	size: number;
	style: {
		top: string;
		left: string;
	};
};
const DEFAULT_COLOR = "#FFFF00";
function generateSparkle(color: string): Sparkle {
	const sparkle = {
		id: String(random(10000, 99999)),
		createdAt: Date.now(),
		color,
		size: random(10, 15),
		style: {
			top: random(-10, 90) + "%",
			left: random(-10, 90) + "%",
		},
	};
	return sparkle;
}
export const Sparkles = ({
	color = DEFAULT_COLOR,
	children,
	...props
}: PropsWithChildren<HTMLAttributes<HTMLElement>>) => {
	const [sparkles, setSparkles] = useState(() => Array(3).map(() => generateSparkle(color)));
	const prefersReducedMotion = usePrefersReducedMotion();

	useRandomInterval(
		() => {
			const sparkle = generateSparkle(color);
			const now = Date.now();
			const nextSparkles = sparkles.filter((sp) => {
				const delta = now - sp.createdAt;
				return delta < 700;
			});
			nextSparkles.push(sparkle);
			setSparkles(nextSparkles);
		},
		prefersReducedMotion ? null : 50,
		prefersReducedMotion ? null : 450,
	);
	return (
		<span {...props} className="relative inline-block">
			{sparkles.map((sparkle) => (
				<Sparkle key={sparkle.id} color={sparkle.color} size={sparkle.size} style={sparkle.style} />
			))}
			<span className="relative z-[2]">{children}</span>
		</span>
	);
};

const Sparkle = ({ size, color, style }: Pick<Sparkle, "size" | "color" | "style">) => {
	const path =
		"M26.5 25.5C19.0043 33.3697 0 34 0 34C0 34 19.1013 35.3684 26.5 43.5C33.234 50.901 34 68 34 68C34 68 36.9884 50.7065 44.5 43.5C51.6431 36.647 68 34 68 34C68 34 51.6947 32.0939 44.5 25.5C36.5605 18.2235 34 0 34 0C34 0 33.6591 17.9837 26.5 25.5Z";
	return (
		<span
			className={`absolute block motion-safe:animate-[grow-shrink_700ms_forwards]`}
			style={style}
		>
			<svg
				width={size}
				height={size}
				viewBox="0 0 68 68"
				fill="none"
				className="block motion-safe:animate-[spin_700ms_linear]"
			>
				<path d={path} fill={color} />
			</svg>
		</span>
	);
};
