import { captureException } from "@sentry/nextjs";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import type { PostgrestError } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";

import { Database } from "@/domains/Supabase/database.types";
import type { ErrorResponse, SuccessResponse } from "@/domains/api";

type AddViewSuccessResponse = SuccessResponse<{
	view_count: number;
	message?: string;
}>;

type AddViewErrorResponse = ErrorResponse<PostgrestError | unknown>;

type AddViewResponse = AddViewSuccessResponse | AddViewErrorResponse;

/**
 * @api {post} /api/page/add-view Add view to page using RPC in Supabase
 */
async function handler(req: NextApiRequest, res: NextApiResponse<AddViewResponse>) {
	if (req.method === "POST") {
		const supabaseServerClient = createServerSupabaseClient<Database>({ req, res });
		const { page_slug } = req.body;

		const { data: view_count, error } = await supabaseServerClient.rpc("upsert_page_view", {
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

export default handler;

export const config = {
	api: {
		externalResolver: true,
	},
};
