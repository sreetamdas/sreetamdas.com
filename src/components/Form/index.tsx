/* eslint-disable indent */
export * from "./styles";

import { Field, FieldProps, useField } from "formik";
import { InputHTMLAttributes } from "react";
import Select, {
	ActionMeta,
	GroupBase,
	OnChangeValue,
	Props as ReactSelectProps,
} from "react-select";

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

type AdditionalSelectProps<Option, IsMulti extends boolean = false> = {
	transformValue?: (value: OnChangeValue<Option, IsMulti>) => void;
};
export const SelectField = <
	Option,
	IsMulti extends boolean = false,
	Group extends GroupBase<Option> = GroupBase<Option>
>({
	name,
	label,
	displayLabel,
	options,
	transformValue,
	...props
}: ReactSelectProps<Option, IsMulti, Group> &
	NameLabelProps &
	AdditionalSelectProps<Option, IsMulti>) => {
	return (
		<Field name={name}>
			{({ field: { value }, form: { setFieldValue }, meta: { error, touched } }: FieldProps) => {
				function handleChange(
					selectedOption: OnChangeValue<Option, IsMulti>,
					_meta: ActionMeta<Option>
				) {
					if (transformValue) {
						setFieldValue(name, transformValue(selectedOption));
					} else {
						setFieldValue(name, selectedOption);
					}
				}

				return (
					<InputGroup>
						<Label htmlFor={name} $show={displayLabel || !!value?.toString().length}>
							{label}
						</Label>
						<Select options={options} onChange={handleChange} isSearchable={false} {...props} />
						{touched && error ? <Error>{error}</Error> : null}
					</InputGroup>
				);
			}}
		</Field>
	);
};
