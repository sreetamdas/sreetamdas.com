import axios from "axios";
import { Formik, FormikHelpers } from "formik";
// eslint-disable-next-line import/no-named-as-default
import toast from "react-hot-toast";

import { BookEntryProperties } from "@/components/Books";
import {
	StyledForm,
	InputField,
	FileInputField,
	SelectField,
	SubmitButton,
} from "@/components/Form";
import { uploadFileToSupabase, getSupabaseFileURL } from "@/domains/supabase";

type FormDataValues = Omit<BookEntryProperties, "cover"> & { cover?: File };
export const UploadBook = () => {
	const initialValues: FormDataValues = {
		name: "",
		author: "",
		status: BookStatus.Have,
	};
	const options = Object.keys(BookStatus).map((status) => ({ value: status, label: status }));

	async function handleSubmit(
		values: FormDataValues,
		{ setSubmitting }: FormikHelpers<FormDataValues>
	) {
		setSubmitting(true);

		const imageFile = values["cover"] as File;
		const { data, error } = await uploadFileToSupabase(imageFile, { path: "/site/keebs/" });
		if (error) {
			toast.error(error.message);
		}

		if (data) {
			toast.success(`Uploaded ${imageFile.name} successfully!`);
			const fileURL = getSupabaseFileURL(data?.Key);
			const formValues: BookEntryProperties = { ...values, cover: fileURL };
			const res = (await axios.post("/api/admin/books/add", formValues)).data;
			// eslint-disable-next-line no-console
			console.log(res);
			setSubmitting(false);
			toast.success(`Uploaded ${values["name"]} successfully!`);
		}
	}

	return (
		<Formik initialValues={initialValues} onSubmit={handleSubmit}>
			{({ isSubmitting }) => (
				<StyledForm>
					<FileInputField name="cover" type="file" label="Upload image" />
					<InputField name="name" type="text" label="Title" required />
					<InputField name="author" type="text" label="Author" required />
					<SelectField
						name="status"
						options={options}
						defaultValue={options?.[0]}
						transformValue={(option) => option?.value}
						label="Status"
					/>
					<SubmitButton isLoading={isSubmitting}>Upload</SubmitButton>
				</StyledForm>
			)}
		</Formik>
	);
};

enum BookStatus {
	Have = "Have",
	Reading = "Reading",
	Want = "Want",
	Finished = "Finished",
}
