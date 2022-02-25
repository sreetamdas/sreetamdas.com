export * from "./styles";

import { useField } from "formik";
import { InputHTMLAttributes } from "react";
import Select, { Props as ReactSelectProps, GroupBase } from "react-select";

import {
	Label,
	Input,
	InputGroup,
	Error,
	FileUploadContainer,
	FileUploadLabel,
} from "@/components/Form/styles";

type NameLabelProps = {
	name: string;
	label: string;
	displayLabel?: boolean;
};

type InputFieldProps<T = Element> = InputHTMLAttributes<T> & NameLabelProps;
export const InputField = ({ label, displayLabel = false, ...props }: InputFieldProps) => {
	const [field, meta] = useField(props);
	const placeholder = props.placeholder ?? label;

	return (
		<InputGroup>
			<Label
				htmlFor={props.id || props.name}
				$show={displayLabel || !!field.value?.toString().length}
			>
				{label}
			</Label>
			<Input placeholder={placeholder} {...field} {...props} />
			{meta.touched && meta.error ? <Error>{meta.error}</Error> : null}
		</InputGroup>
	);
};

type FileInputFieldProps = Omit<InputFieldProps, "displayLabel">;
export const FileInputField = ({ label, ...props }: FileInputFieldProps) => {
	const [, meta, helpers] = useField(props);

	return (
		<FileUploadContainer>
			<FileUploadLabel>
				{label}
				<Input
					{...props}
					onChange={(event) => {
						event.preventDefault();
						helpers.setValue(event.target.files?.[0]);
					}}
				/>
			</FileUploadLabel>
			{meta.touched && meta.error ? <Error>{meta.error}</Error> : null}
		</FileUploadContainer>
	);
};

type SelectFieldProps = NameLabelProps & ReactSelectProps & { placeholder?: string };
export const SelectField: <
	Option,
	IsMulti extends boolean = false,
	Group extends GroupBase<Option> = GroupBase<Option>
>(
	props: ReactSelectProps<Option, IsMulti, Group>
) => JSX.Element = ({ label, displayLabel, ...props }) => {
	const [field, meta, helpers] = useField(props);

	const { options } = field;
	const { touched, error } = meta;
	const { setValue } = helpers;

	return (
		<InputGroup>
			<Label
				htmlFor={field.id || field.name}
				$show={displayLabel || !!field.value?.toString().length}
			>
				{label}
			</Label>
			<Select
				options={options}
				defaultValue={options?.[0]}
				onChange={(option) => setValue(option?.value)}
				isSearchable={false}
			/>
			{touched && error ? <Error>{error}</Error> : null}
		</InputGroup>
	);
};
