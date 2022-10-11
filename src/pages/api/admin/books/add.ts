import { NextApiRequest, NextApiResponse } from "next";

import { BookEntryProperties } from "@/components/Books";
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

			return res.status(200).send({ book });
		} else {
			res.status(400);
		}
	} catch (error) {
		res.status(500).json({ error });
	}
}

export default handler;

export const config = {
	api: {
		externalResolver: true,
	},
};
