/* eslint-disable indent */
export * from "./styles";

import { Field, FieldProps, useField } from "formik";
import { InputHTMLAttributes, useState } from "react";
import Select, {
	ActionMeta,
	GroupBase,
	OnChangeValue,
	Props as ReactSelectProps,
	StylesConfig,
} from "react-select";

import {
	Label,
	Input,
	InputGroup,
	Error,
	FileUploadContainer,
	UploadedFilePreviewContainer,
	UploadedFileMesssage,
	FileUploadLabel,
	FileUploadIcon,
	customSelectStyles,
} from "./styles";

import { CustomImage } from "@/components/mdx/images";

type NameLabelProps = {
	name: string;
	label: string;
	displayLabel?: boolean;
};

type InputFieldProps<T = Element> = InputHTMLAttributes<T> & NameLabelProps;
export const InputField = ({ label, displayLabel = false, ...props }: InputFieldProps) => {
	const [field, meta] = useField<string>(props);
	const [isFocused, setIsFocused] = useState(false);
	const placeholder = props.placeholder ?? label;

	return (
		<InputGroup>
			<Label
				htmlFor={props.id || props.name}
				$show={displayLabel || !!field.value?.toString().length}
				$isFocused={isFocused}
			>
				{label}
			</Label>
			<Input
				placeholder={placeholder}
				{...field}
				{...props}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
			/>
			{meta.touched && meta.error ? <Error>{meta.error}</Error> : null}
		</InputGroup>
	);
};

type FileInputFieldProps = Omit<InputFieldProps, "displayLabel">;
export const FileInputField = ({ label, ...props }: FileInputFieldProps) => {
	const [field, meta, helpers] = useField(props);

	return (
		<FileUploadContainer>
			<FileUploadLabel>
				{field.value ? (
					<UploadedFilePreviewContainer>
						<UploadedFileMesssage>Image selected</UploadedFileMesssage>
						<UploadImagePreview image={field.value} />
					</UploadedFilePreviewContainer>
				) : (
					<>
						<FileUploadIcon />
						{label}
					</>
				)}
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

// Display image uploaded from file system
const UploadImagePreview = ({ image }: { image: File }) => {
	const [preview, setPreview] = useState<string | null>(null);
	const reader = new FileReader();
	reader.readAsDataURL(image);
	reader.onload = () => {
		setPreview(reader.result as string);
	};

	return preview ? <CustomImage src={preview} alt="preview" /> : <>loading</>;
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
	AdditionalSelectProps<Option, IsMulti>) => (
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
					<Select
						options={options}
						onChange={handleChange}
						isSearchable={false}
						components={{
							IndicatorSeparator: () => null,
						}}
						styles={customSelectStyles as unknown as StylesConfig<Option, IsMulti, Group>}
						{...props}
					/>
					{touched && error ? <Error>{error}</Error> : null}
				</InputGroup>
			);
		}}
	</Field>
);
