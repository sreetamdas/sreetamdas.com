import styled, { css, FlattenSimpleInterpolation, StyledComponentProps } from "styled-components";

export const screenReaderOnlyMixin = css`
	clip: rect(0 0 0 0);
	clip-path: inset(50%);
	height: 1px;
	overflow: hidden;
	position: absolute;
	white-space: nowrap;
	width: 1px;
`;

/**
 * Screen reader only content
 */
export const SROnly = styled.span`
	${screenReaderOnlyMixin}
`;

/**
 * Applies the provided style when the provided prop is true
 * @param props name of boolean component prop
 * @param style css`` block with style to apply when true
 * @returns
 */
export function whenProp(props: string | string[], style: FlattenSimpleInterpolation) {
	const normalizedProps = typeof props === "string" ? [props] : props;
	return (
		componentProps: StyledComponentProps<
			keyof JSX.IntrinsicElements | React.ComponentType<unknown>,
			object,
			Record<string, unknown>,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			keyof any
		>
	) => (normalizedProps.some((prop) => componentProps[prop]) ? style : null);
}

/**
 * Applies the provided style when the provided prop is false
 * @param props name of boolean component prop
 * @param style css`` block with style to apply when true
 * @returns
 */
export function unlessProp(props: string | string[], style: FlattenSimpleInterpolation) {
	const normalizedProps = typeof props === "string" ? [props] : props;
	return (
		componentProps: StyledComponentProps<
			keyof JSX.IntrinsicElements | React.ComponentType<unknown>,
			object,
			Record<string, unknown>,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			keyof any
		>
	) => (normalizedProps.some((prop) => componentProps[prop]) ? null : style);
}
