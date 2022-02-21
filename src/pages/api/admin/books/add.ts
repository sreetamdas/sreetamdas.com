import { NextApiRequest, NextApiResponse } from "next";

import { BookEntryProperties } from "@/components/Books";
import { uploadFileToSupabase, getSupabaseFileURL } from "@/domains/supabase";
import { prismaClient } from "@/utils/prismaClient";

type RequestBody = Omit<BookEntryProperties, "cover"> & {
	cover: File;
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === "POST") {
		const { name, cover, author, status } = req.body as RequestBody;

		// Upload cover image and get public URL

		const { data, error } = await uploadFileToSupabase(cover);
		if (error) {
			return res.status(500).json({ error: error.message });
		}
		if (data) {
			const fileURL = getSupabaseFileURL(data?.Key);
			console.log(fileURL);

			const book = await prismaClient.books.create({
				data: {
					name,
					cover: fileURL,
					authors: {
						connectOrCreate: {
							where: {
								name: author,
							},
							create: {
								name: author,
							},
						},
					},
					book_status: {
						connectOrCreate: {
							where: {
								value: status,
							},
							create: {
								value: status,
							},
						},
					},
				},
				include: {
					authors: true,
					book_status: true,
				},
			});
			console.log("created");

			// console.log({ book });

			// return res.status(200).json({ book });
		}
	} else {
		res.status(400);
	}
};
