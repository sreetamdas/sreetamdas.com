import { NextApiRequest, NextApiResponse } from "next";

import { supabase } from "utils/supabaseClient";

/**
 * @api {post} /api/page/add-view Add view to page using Supabase client
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === "POST") {
		const { page_slug } = req.body;

		const { data: views, error } = await supabase.rpc("increment_page_view", {
			page_slug,
		});

		if (error) {
			res.status(500).send(error);
		} else {
			res.status(200).send({ views });
		}
	} else {
		res.status(400).send("Bad request");
	}
};
