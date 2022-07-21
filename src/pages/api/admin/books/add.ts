import { withSentry } from "@sentry/nextjs";
import { NextApiRequest, NextApiResponse } from "next";

import { BookEntryProperties, handleBookUploadToNotion } from "@/components/Books";
import { PrismaClient } from "@/domains/Prisma";

// @ts-expect-error BigInt prototype
BigInt.prototype.toJSON = function () {
	return this.toString();
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		if (req.method === "POST") {
			const { name, cover, author, status } = req.body as BookEntryProperties;

			const book = await PrismaClient.books.create({
				data: {
					name,
					cover,
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
			});
			const notionResponse = await handleBookUploadToNotion(book);
			return res.status(200).send({ book, notionResponse });
		} else {
			res.status(400);
		}
	} catch (error) {
		res.status(500).json({ error });
	}
}

export default withSentry(handler);

export const config = {
	api: {
		externalResolver: true,
	},
};
