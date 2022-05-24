import styled, { css, keyframes } from "styled-components";

import { ButtonProps } from "./";

import { sharedTransition } from "@/styles/components";
import { focusVisible, pixelToRem } from "@/utils/style";

export const ButtonMain = styled.button<ButtonProps>`
	position: relative;
	cursor: pointer;
	background-color: var(--color-background);
	border-radius: var(--border-radius);
	border: 2px solid var(--color-primary-accent);
	color: var(--color-primary);

	${sharedTransition("color, background-color")}
	${focusVisible(css`
		background-color: var(--color-primary-accent);
		color: var(--color-background);
	`)}
	&:hover {
		background-color: var(--color-primary-accent);
		color: var(--color-background);
	}

	/* variants with different padding */
	${({ size }) => {
		switch (size) {
			case "sm":
			case "small":
				return css`
					font-size: ${pixelToRem(13)};
					padding: 0 10px;
					min-height: 30px;
					min-width: 80px;
				`;
			case "md":
			case "medium":
			default:
				return css`
					font-size: ${pixelToRem(15)};
					padding: 0 25px;
					min-height: 40px;
					min-width: 100px;
				`;
			case "lg":
			case "large":
				return css`
					font-size: 1rem;
					padding: 0 50px;
					min-height: 50px;
					min-width: 180px;
				`;
		}
	}}
`;

export const ButtonUnstyled = styled.button`
	background-color: transparent;
	border: none;
	color: inherit;

	display: flex;
	align-items: center;
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export const LoadingAddon = styled.span`
	position: absolute;
	display: block;
	width: 1rem;
	height: 1rem;
	top: calc(50% - 0.5rem);
	left: calc(50% - 0.5rem);
	border-width: 2px;
	border-color: var(--color-primary);
	border-bottom-color: transparent;
	border-left-color: transparent;
	border-style: solid;
	border-radius: 50%;
	animation: ${spin} 0.45s linear infinite;
`;
