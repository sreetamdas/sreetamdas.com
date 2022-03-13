import { NextApiRequest, NextApiResponse } from "next";

import { supabaseClient } from "@/domains/Supabase";
import { PostDetails } from "@/typings/blog";

/**
 * @api {post} /api/page/add-view Get view_count for page using Supabase client
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === "GET") {
		const { slug } = req.query;

		// TODO: Add support for multiple slugs
		if (Array.isArray(slug)) {
			res.status(200).send({ view_count: 1, message: "This isn't supported yet, nice try!" });
		}
		// TODO: Add support for getting all/multiple slug views
		else {
			const { data, error } = await supabaseClient
				.from<PostDetails>("page_details")
				.select("view_count")
				.eq("slug", slug)
				.limit(1)
				.single();

			if (error) {
				res.status(200).send({ view_count: 0 });
			} else {
				const { view_count } = data ?? { view_count: 0 };
				res.status(200).send({ view_count });
			}
		}
	} else {
		res.status(400).send("Bad request");
	}
};
