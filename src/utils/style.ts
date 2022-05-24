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

export function focusVisible(rules: FlattenSimpleInterpolation, onHover?: boolean) {
	return css`
		.js-focus-visible &:focus {
			outline: none;
		}

		&:focus-visible {
			${rules}
		}

		&:focus.focus-visible {
			${rules}
		}

		${onHover &&
		css`
			&:hover {
				${rules}
			}
		`}
	`;
}
