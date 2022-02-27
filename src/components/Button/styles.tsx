import styled, { css, keyframes } from "styled-components";

import { ButtonProps } from "./";

import { sharedTransition } from "@/styles/components";

export const ButtonMain = styled.button<ButtonProps>`
	cursor: pointer;
	background-color: var(--color-background);
	border-radius: var(--border-radius);
	border: 2px solid var(--color-primary-accent);
	color: var(--color-primary);

	${sharedTransition("color, background-color")}

	&:hover, &:focus {
		background-color: var(--color-primary-accent);
		color: var(--color-background);
	}

	&:focus {
		outline: 0;
		box-shadow: unset;
	}

	/* variants with different padding */
	${({ size }) => {
		switch (size) {
			case "sm":
			case "small":
				return css`
					font-size: 0.75rem;
					padding: 5px 10px;
				`;
			case "md":
			case "medium":
			default:
				return css`
					font-size: 0.85rem;
					padding: 10px 30px;
				`;
			case "lg":
			case "large":
				return css`
					font-size: 1rem;
					padding: 15px 80px;
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
	width: 1em;
	height: 1em;
	top: calc(50% - 0.5em);
	left: calc(50% - 0.5em);
	border-width: 2px;
	border-color: var(--button-colorText);
	border-bottom-color: transparent;
	border-left-color: transparent;
	border-style: solid;
	border-radius: 50%;
	animation: ${spin} 0.45s linear infinite;
`;
