import styled, { css } from "styled-components";

import { sharedTransition } from "@/styles/components";

const BUTTON_SIZES = ["sm", "small", "md", "medium", "lg", "large"] as const;
type ButtonProps = {
	size?: typeof BUTTON_SIZES[number];
};
export const Button = styled.button<ButtonProps>`
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
