import axios from "axios";
import { FormEvent } from "react";

export const UploadBook = () => {
	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = {};
		new FormData(event.target as HTMLFormElement).forEach((value, key) => {
			formData[key] = value;
		});

		console.log(formData);
		await axios.post("/api/admin/books/add", formData);
	}

	return (
		// Form to upload an image
		<div>
			<form onSubmit={handleSubmit}>
				<input type="name" name="name" placeholder="Name" required />
				<input type="name" name="author" placeholder="Author" required />
				<input type="file" name="cover" required />
				{/* select tag with book status */}
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
