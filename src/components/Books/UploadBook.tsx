import { useSupabaseClient } from "@supabase/auth-helpers-react";
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
import { Database } from "@/domains/Supabase/database.types";
import { randomAlphanumeric } from "@/utils/hooks";

export const UploadBook = () => {
	const supabaseClient = useSupabaseClient<Database>();

	type FormDataValues = Omit<BookEntryProperties, "cover"> & { cover?: File };
	const initialValues: FormDataValues = {
		name: "",
		author: "",
		status: BookStatus.Have,
	};
	const bookStatusOptions = Object.keys(BookStatus).map((status) => ({
		value: status,
		label: status,
	}));

	type UploadFileToSupabaseProps = {
		bucket?: string;
		path?: string;
		useExactFilename?: boolean;
	};
	async function uploadFileToSupabase(
		image: File,
		{ bucket = "public", path = "/", useExactFilename = false }: UploadFileToSupabaseProps
	) {
		const RE_filenameExtension = /(.+)(\.[^.]+?)$/;
		const [, filename, fileExtension] = RE_filenameExtension.exec(image.name) ?? [];

		const filenameToUpload = useExactFilename
			? `${path}${filename}${fileExtension}`
			: `${path}${filename}-${randomAlphanumeric()}${fileExtension}`;

		return await supabaseClient.storage.from(bucket).upload(filenameToUpload, image);
	}

	async function handleSubmit(
		values: FormDataValues,
		{ setSubmitting }: FormikHelpers<FormDataValues>
	) {
		setSubmitting(true);

		const imageFile = values["cover"] as File;
		const toastUploadImageToSupabase = toast.loading("Uploading image ...");
		const { data, error } = await uploadFileToSupabase(imageFile, { path: "/website/books/" });
		if (error) {
			toast.error(error.message, { id: toastUploadImageToSupabase });
		}

		if (data) {
			toast.success("Uploaded successfully!", { id: toastUploadImageToSupabase });
			const fileURL = getSupabaseFileURL(data);
			const formValues: BookEntryProperties = { ...values, cover: fileURL };
			await handleUploadBookDetails(formValues);
			const toastUploadBooksDetails = toast.loading("Uploading book details ...");

			toast.success(`Uploaded ${values["name"]} successfully!`, { id: toastUploadBooksDetails });
		}
		setSubmitting(false);
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
						options={bookStatusOptions}
						defaultValue={bookStatusOptions?.[0]}
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

async function handleUploadBookDetails(data: BookEntryProperties) {
	return await axios.post("/api/admin/books/add", data);
}

function getSupabaseFileURL({ path }: { path: string }) {
	return `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL}/storage/v1/object/public/${path}`;
}
