import axios from "axios";
import { FormEvent } from "react";
// eslint-disable-next-line import/no-named-as-default
import toast from "react-hot-toast";

import { BookEntryProperties } from "@/components/Books";
import { uploadFileToSupabase, getSupabaseFileURL } from "@/domains/supabase";

type FormDataValues =
	| BookEntryProperties
	| (Omit<BookEntryProperties, "cover"> & {
			cover: File;
	  });

export const UploadBook = () => {
	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = {} as FormDataValues;

		// @ts-expect-error Form fields are not typed
		new FormData(event.target as HTMLFormElement).forEach((value, key: keyof FormDataValues) => {
			// @ts-expect-error File is not assignable to type string
			formData[key] = value;
		});

		const imageFile = formData["cover"] as File;
		const { data, error } = await uploadFileToSupabase(imageFile, { path: "/site/keebs/" });
		if (error) {
			toast.error(error.message);
		}
		if (data) {
			toast.success(`Uploaded ${imageFile.name} successfully!`);
			const fileURL = getSupabaseFileURL(data?.Key);
			formData["cover"] = fileURL;
		}
		const res = (await axios.post("/api/admin/books/add", formData)).data;
		// eslint-disable-next-line no-console
		console.log(res);
	}

	return (
		// Form to upload an image
		<div>
			<form onSubmit={handleSubmit}>
				<input type="name" name="name" placeholder="Name" required />
				<input type="name" name="author" placeholder="Author" required />
				<input type="file" name="cover" required />
				<select name="status">
					{Object.keys(BookStatus).map((status) => (
						<option key={status} value={status}>
							{status}
						</option>
					))}
				</select>
				<button type="submit">Upload</button>
			</form>
		</div>
	);
};

enum BookStatus {
	Have = "Have",
	Reading = "Reading",
	Want = "Want",
	Finished = "Finished",
}
