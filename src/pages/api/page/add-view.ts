import { captureException } from "@sentry/nextjs";
import { NextApiRequest, NextApiResponse } from "next";

import { getSupabaseClient } from "@/domains/Supabase";
import type { ErrorResponse, SuccessResponse } from "@/domains/api";

type AddViewSuccessResponse = SuccessResponse<{
	view_count: number;
	message?: string;
}>;

type AddViewErrorResponse = ErrorResponse;

type AddViewResponse = AddViewSuccessResponse | AddViewErrorResponse;

/**
 * @api {post} /api/page/add-view Add view to page using RPC in Supabase
 */
async function handler(req: NextApiRequest, res: NextApiResponse<AddViewResponse>) {
	const { enabled: supabaseEnabled, supabaseClient } = getSupabaseClient();

	if (!supabaseEnabled) {
		res.status(400).json({ error: "Supabase is not intialised" });
	} else {
		if (req.method === "POST") {
			const { page_slug } = req.body;

			const { data: view_count, error } = await supabaseClient.rpc("upsert_page_view", {
				page_slug,
			});

			if (error) {
				captureException(error);
				res.status(500).json({ error });
			} else {
				// @ts-expect-error view_count is number here, not number[]
				res.status(200).json({ view_count });
			}
		} else {
			res.status(400).json({ error: "Bad request" });
		}
	}
}

export default handler;

export const config = {
	api: {
		externalResolver: true,
	},
};
