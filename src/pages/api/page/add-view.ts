import { withSentry } from "@sentry/nextjs";
import { NextApiRequest, NextApiResponse } from "next";

import { supabaseClient } from "@/domains/Supabase";
import type { ErrorResponse, SuccessResponse } from "@/domains/api";
import { PostDetails } from "@/typings/blog";

type AddViewSuccessResponse = SuccessResponse<{
	view_count: number;
	message?: string;
}>;

type AddViewErrorResponse = ErrorResponse;

type AddViewResponse = AddViewSuccessResponse | AddViewErrorResponse;

/**
 * @api {post} /api/page/add-view Add view to page using RPC in Supabase
 */
const handler = async (req: NextApiRequest, res: NextApiResponse<AddViewResponse>) => {
	if (req.method === "POST") {
		const { page_slug } = req.body;

		const { data: view_count, error } = await supabaseClient.rpc<PostDetails["view_count"]>(
			"upsert_page_view",
			{
				page_slug,
			}
		);

		if (error) {
			res.status(500).json({ error });
		} else {
			res.status(200).json({ view_count });
		}
	} else {
		res.status(400).json({ error: "Bad request" });
	}
};

export default withSentry(handler);

export const config = {
	api: {
		externalResolver: true,
	},
};
