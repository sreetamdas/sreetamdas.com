import { NextApiRequest, NextApiResponse } from "next";

import { PostDetails } from "typings/blog";
import { supabase } from "utils/supabaseClient";

/**
 * @api {post} /api/page/add-view Get views for page using Supabase client
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === "GET") {
		const { page_slug } = req.body;

		const { data, error } = await supabase
			.from<PostDetails>("page_details")
			.select("view_count")
			.eq("slug", page_slug)
			.limit(1)
			.single();

		if (error) {
			res.status(200).send({ views: 0 });
		} else {
			const { view_count: views } = data ?? { view_count: 0 };
			res.status(200).send({ views });
		}
	} else {
		res.status(400).send("Bad request");
	}
};
