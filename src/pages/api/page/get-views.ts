import { withSentry } from "@sentry/nextjs";
import { NextApiRequest, NextApiResponse } from "next";

import { SupabaseClient } from "@/domains/Supabase";
import type { ErrorResponse, SuccessResponse } from "@/domains/api";
import { PostDetails } from "@/typings/blog";

type GetViewsSuccessResponse = SuccessResponse<{
	view_count: number;
	message?: string;
}>;

type GetViewsErrorResponse = ErrorResponse;

type GetViewsResponse = GetViewsSuccessResponse | GetViewsErrorResponse;

/**
 * @api {post} /api/page/get-views Get view_count for page using Supabase client
 */
async function handler(req: NextApiRequest, res: NextApiResponse<GetViewsResponse>) {
	if (req.method === "GET") {
		const { slug } = req.query;

		if (typeof slug === "undefined") {
			res.status(400).json({
				error: "Missing slug",
			});
			return;
		}

		// TODO: Add support for multiple slugs
		if (Array.isArray(slug)) {
			res.status(200).send({ view_count: 1, message: "This isn't supported yet, nice try!" });
		}
		// TODO: Add support for getting all/multiple slug views
		else {
			const { data, error } = await SupabaseClient.from<PostDetails>("page_details")
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
		res.status(400).json({ error: "Bad request" });
	}
}

export default withSentry(handler);

export const config = {
	api: {
		externalResolver: true,
	},
};
