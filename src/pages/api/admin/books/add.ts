import { NextApiRequest, NextApiResponse } from "next";

import { BookEntryProperties } from "@/components/Books";
import { prismaClient } from "@/domains/Prisma";

// @ts-expect-error BigInt prototype
BigInt.prototype.toJSON = function () {
	return this.toString();
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		if (req.method === "POST") {
			const { name, cover, author, status } = req.body as BookEntryProperties;

			const book = await prismaClient.books.create({
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
				include: {
					authors: true,
					book_status: true,
				},
			});
			return res.status(200).send({ book });
		} else {
			res.status(400);
		}
	} catch (error) {
		res.status(500).json({ error });
	}
};
