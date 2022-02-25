import { Form } from "formik";
import styled, { css } from "styled-components";

import { buttonStylesMixin } from "@/components/foobar/styled";
import { whenProp } from "@/domains/style/helpers";
import { sharedTransition } from "@/styles/components";
import { pixelToRem } from "@/utils/style";

export const StyledForm = styled(Form)`
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: stretch;

	gap: 15px;
`;

export const VericallyCenteredForm = styled(StyledForm)`
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	flex-shrink: 0;
`;

export const Input = styled.input`
	width: 100%;
	font-size: ${pixelToRem(16)};
	background-color: var(--color-background);
	color: var(--color-primary);
	padding: 10px;
	border-radius: var(--border-radius);
	border: 2px solid var(--color-inlineCode-bg);

	&:focus-visible {
		box-shadow: unset;
		border-color: var(--color-primary-accent);
	}

	${sharedTransition("color, background-color, border")}
`;

export const Label = styled.label<{ $show: boolean }>`
	font-size: ${pixelToRem(12)};
	margin: 0 10px 5px 0;

	transform: translateY(5px);
	opacity: 0;

	${whenProp(
		"$show",
		css`
			transform: translateY(0);
			opacity: 1;
		`
	)}

	${sharedTransition("color, transform, opacity")}
`;

export const Error = styled.p`
	color: var(--color-error);
`;

export const InputGroup = styled.div`
	display: flex;
	flex-direction: column;
	align-items: start;
`;

export const FileUploadContainer = styled.div`
	width: 100%;

	&:not(:first-child) {
		margin-top: 23px;
	}
`;

export const FileUploadLabel = styled.label`
	position: relative;
	font-size: ${pixelToRem(16)};
	display: block;
	border-radius: var(--border-radius);
	border: 2px solid var(--color-inlineCode-bg);
	padding: 36px;
	cursor: pointer;

	&:hover,
	&:focus,
	&:focus-within {
		border-color: var(--color-primary-accent);
	}

	input[type="file"] {
		width: unset;
		opacity: 0;
		position: absolute;
		pointer-events: none;
		border: unset;
	}

	${sharedTransition("color, background-color, border")}
`;

export const Button = styled.input<{ disabled: boolean }>`
	${buttonStylesMixin}
	font-size: 16px;
	padding: 0;
	align-self: baseline;

	${({ disabled }) =>
		disabled &&
		css`
			cursor: not-allowed;
			opacity: 0.5;
		`}
`;
