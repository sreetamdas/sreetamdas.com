import { css, FlattenSimpleInterpolation } from "styled-components";

export const BASE_FONT_SIZE = 18;

type TBreakpoint = keyof typeof BREAKPOINTS;
export const BREAKPOINTS = {
	xs: 320,
	sm: 400,
	md: 768,
	lg: 1060,
	xl: 1440,
};

type TBreakpointSide = typeof breakpointSides[number];
const breakpointSides = ["until", "from"] as const;

export const pixelToRem = (fontSize: number) =>
	`${fontSize / BASE_FONT_SIZE}rem`;

export const getIsMobileLayout = () =>
	typeof window !== "undefined" && window.innerWidth < BREAKPOINTS.md;

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
				[name]: (...styles: FlattenSimpleInterpolation) => {
					return css`
						@media (min-width: ${size}px) {
							${styles}
						}
					`;
				},
			}),
			{} as TBreakpointFn
		),
	}),
	{} as TBreakpointFn
);
