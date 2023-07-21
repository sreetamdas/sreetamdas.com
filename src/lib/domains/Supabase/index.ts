import { captureException } from "@sentry/nextjs";

import { supabaseClient } from "./client";
type PageViewCount = {
	view_count: number;
};

type SuccessResponse<Type = unknown> = { data: Type };
type ErrorResponse<Type = unknown> = {
	errorCode?: number;
	error: Type;
	message?: string;
};
type PageViewCountResponse = SuccessResponse<PageViewCount> | ErrorResponse;

const supabaseEnabled =
	typeof process.env.NEXT_PUBLIC_SUPABASE_URL !== "undefined" &&
	process.env.NEXT_PUBLIC_SUPABASE_URL !== "" &&
	typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "undefined" &&
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "";

/**
 * Get page view_count
 * @param slug page slug
 * @returns Get page view_count
 */
export async function getPageViews(slug: string): Promise<PageViewCountResponse> {
	try {
		if (!supabaseEnabled) {
			throw new Error("Supabase is not initialized");
		}

		const { data, error } = await supabaseClient
			.from("page_details")
			.select("view_count")
			.eq("slug", slug)
			.limit(1)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				captureException(
					new Error(`Page ${slug} has not been added to the database yet`, { cause: error })
				);

				return { data: { view_count: 0 } };
			} else {
				captureException(error);
				return { error, errorCode: 500 };
			}
		} else {
			const { view_count } = data;
			return { data: { view_count } };
		}
	} catch (error) {
		captureException(error);
		return { error, errorCode: 500 };
	}
}

/**
 * Upsert page view_count
 * @param slug page slug
 * @returns upserted page view_count after incrementing
 */
export async function upsertPageViews(slug: string): Promise<PageViewCountResponse> {
	try {
		if (!supabaseEnabled) {
			throw new Error("Supabase is not initialized");
		}

		const { data: view_count, error } = await supabaseClient.rpc("upsert_page_view", {
			page_slug: slug,
		});

		if (error) {
			throw new Error(`Supabase error while adding page view for ${slug}`, { cause: error });
		}
		return { data: { view_count } };
	} catch (error) {
		captureException(error);
		return { error, errorCode: 500 };
	}
}
