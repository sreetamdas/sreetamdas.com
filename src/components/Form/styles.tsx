import { Form } from "formik";
import { IoImageOutline } from "react-icons/io5";
import { StylesConfig } from "react-select";
import styled, { css } from "styled-components";

import { Button } from "@/components/Button";
import { ImageWrapper } from "@/components/mdx/images";
import { whenProp } from "@/domains/style/helpers";
import { sharedTransition } from "@/styles/components";
import { focusVisible, pixelToRem } from "@/utils/style";

export const StyledForm = styled(Form)`
	width: 100%;
	max-width: min(var(--max-width) * 0.66, 100vw);
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

	${focusVisible(css`
		box-shadow: unset;
		border-color: var(--color-primary-accent);
	`)}

	${sharedTransition("color, background-color, border")}
`;

export const Label = styled.label<{ $show: boolean; $isFocused?: boolean }>`
	font-size: ${pixelToRem(12)};
	margin: 0 10px 5px 0;
	padding: 0 10px;

	transform: translateY(5px);
	opacity: 0;

	${whenProp(
		"$show",
		css`
			transform: translateY(0);
			opacity: 1;
		`
	)}

	${whenProp(
		"$isFocused",
		css`
			color: var(--color-primary-accent);
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
	display: flex;
	flex-direction: column;

	&:not(:first-child) {
		margin-top: 23px;
	}
`;

export const UploadedFilePreviewContainer = styled.div`
	display: flex;
	width: 100%;
	max-height: 350px;

	${ImageWrapper} {
		height: min-content;
		img {
			max-height: 350px;
			width: auto;
		}
	}
`;

export const UploadedFileMesssage = styled.span`
	display: flex;
	align-items: center;
	justify-content: center;
	flex-grow: 1;
`;

export const FileUploadLabel = styled.label`
	position: relative;
	font-size: ${pixelToRem(16)};
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 5px;
	border-radius: var(--border-radius);
	border: 2px solid var(--color-inlineCode-bg);
	box-sizing: border-box;

	min-height: 350px;
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

export const FileUploadIcon = styled(IoImageOutline)`
	width: 40px;
	height: auto;
`;

export const customSelectStyles: StylesConfig = {
	container: (provided) => ({
		...provided,
		width: "100%",
		height: "100%",
		border: "none",
		borderRadius: "var(--border-radius)",
		margin: "0",
		outline: "none",
	}),
	control: (provided, state) => ({
		...provided,
		backgroundColor: "var(--color-background)",
		color: "var(--color-primary)",
		boxShadow: "none",
		border: (() => {
			const borderColor = (() => {
				if (state.isFocused) {
					return "var(--color-primary-accent)";
				}

				return "var(--color-inlineCode-bg)";
			})();

			return `2px solid ${borderColor}`;
		})(),
		"&:hover, &:focus": {
			borderColor: "var(--color-primary-accent)",
		},
		"&:focus-visible": {
			borderColor: "var(--color-primary-accent)",
		},
	}),
	indicatorSeparator: (provided, state) => ({
		...provided,
		backgroundColor: state.isFocused ? "var(--color-primary)" : "var(--color-inlineCode-bg)",
	}),
	dropdownIndicator: (provided, state) => ({
		...provided,
		color: state.isFocused ? "var(--color-primary)" : "var(--color-inlineCode-bg)",
	}),
	menu: (provided) => ({
		...provided,
		backgroundColor: "var(--color-background)",
	}),
	menuList: (provided) => ({
		...provided,
		backgroundColor: "var(--color-background)",
		border: "2px solid var(--color-inlineCode-bg)",
		borderRadius: "var(--border-radius)",
	}),
	option: (provided, state) => ({
		...provided,
		backgroundColor: state.isFocused ? "var(--color-primary-accent)" : "var(--color-background)",
		color: state.isFocused ? "var(--color-background)" : "var(--color-primary)",
		padding: "10px",
		"&:hover": {
			backgroundColor: "var(--color-primary-accent)",
			color: "var(--color-background)",
		},
	}),
	singleValue: (provided) => ({
		...provided,
		color: "var(--color-primary)",
	}),
};

export const SubmitButton = styled(Button).attrs({
	type: "submit",
})`
	width: min-content;

	&:disabled,
	&[disabled] {
		cursor: not-allowed;
		opacity: 0.5;
	}
`;
