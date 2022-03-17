import { css, FlattenSimpleInterpolation } from "styled-components";

export const BASE_FONT_SIZE = 18;

export type TBreakpoint = keyof typeof BREAKPOINTS;
export const BREAKPOINTS = {
	xs: 320,
	sm: 400,
	md: 768,
	lg: 1060,
	xl: 1440,
};

export function pixelToRem(fontSize: number) {
	return `${fontSize / BASE_FONT_SIZE}rem`;
}

export function getIsMobileLayout() {
	if (typeof window === "undefined") return false;

	const root = window.document.documentElement;
	const isMobileLayout = root.style.getPropertyValue("--is-mobile-layout") === "true";

	return isMobileLayout;
}

type TBreakpointSide = typeof breakpointSides[number];
const breakpointSides = ["until", "from"] as const;
type TBreakpointFn = {
	[side in TBreakpointSide]: {
		[key in TBreakpoint]: (styles: FlattenSimpleInterpolation) => string;
	};
};
export const breakpoint = breakpointSides.reduce(
	(partial, curr) => ({
		...partial,
		[curr]: Object.entries(BREAKPOINTS).reduce(
			(useBreakpoint, [name, size]) => ({
				...useBreakpoint,
				[name]: (...styles: FlattenSimpleInterpolation) =>
					curr === "until"
						? css`
								@media (max-width: ${size - 1}px) {
									${styles}
								}
						  `
						: css`
								@media (min-width: ${size}px) {
									${styles}
								}
						  `,
			}),
			{} as TBreakpointFn
		),
	}),
	{} as TBreakpointFn
);
