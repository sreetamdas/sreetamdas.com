import styled, { css, FlattenSimpleInterpolation, ThemedStyledProps } from "styled-components";

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
export function whenProp<P, T>(props: string | string[], style: FlattenSimpleInterpolation) {
	const normalizedProps = typeof props === "string" ? [props] : props;
	return (componentProps: ThemedStyledProps<P, T>) =>
		// @ts-expect-error - TS doesn't know that the componentProps object has the props property
		normalizedProps.some((prop) => componentProps[prop]) ? style : null;
}

/**
 * Applies the provided style when the provided prop is false
 * @param props name of boolean component prop
 * @param style css`` block with style to apply when true
 * @returns
 */
export function unlessProp<P, T>(props: string | string[], style: FlattenSimpleInterpolation) {
	const normalizedProps = typeof props === "string" ? [props] : props;
	return (componentProps: ThemedStyledProps<P, T>) =>
		// @ts-expect-error - TS doesn't know that the componentProps object has the props property
		normalizedProps.some((prop) => componentProps[prop]) ? null : style;
}
