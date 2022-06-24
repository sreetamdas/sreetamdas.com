import { ButtonHTMLAttributes, forwardRef } from "react";

import { ButtonMain, LoadingAddon } from "./styles";

const BUTTON_SIZES = ["sm", "small", "md", "medium", "lg", "large"] as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	$size?: typeof BUTTON_SIZES[number];
	isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ isLoading = false, children, ...props },
	ref
) {
	return (
		<ButtonMain ref={ref} disabled={isLoading} {...props}>
			{isLoading ? <LoadingAddon /> : children}
		</ButtonMain>
	);
});
