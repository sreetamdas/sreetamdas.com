import { captureException } from "@sentry/nextjs";

type PageViewCount = {
	view_count: number;
};

type SuccessResponse<Type = unknown> = { data: Type };
type ErrorResponse<Type = unknown> = {
	errorCode?: number;
	error: Type;
};
type PageViewCountResponse =
	| (SuccessResponse<PageViewCount> & ErrorResponse<null>)
	| (ErrorResponse & SuccessResponse<null>);

const supabaseEnabled =
	typeof process.env.NEXT_PUBLIC_SUPABASE_URL !== "undefined" &&
	process.env.NEXT_PUBLIC_SUPABASE_URL !== "" &&
	typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "undefined" &&
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "";

const supabaseHeaders = {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	apiKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
	Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
};

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

		const params = new URLSearchParams({
			slug: `eq.${slug}`,
			select: "view_count",
			limit: "1",
		});

		const request = await fetch(
			`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/page_details?${params.toString()}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					...supabaseHeaders,
				},
				cache: "no-cache",
			}
		);

		const response: Array<PageViewCount> = await request.json();
		const view_count = response[0];

		if (typeof view_count === "undefined")
			throw new Error("Page has not been added to the database yet", { cause: { view_count } });

		return { data: view_count, error: null };
	} catch (error) {
		captureException(error);
		return { error, data: null };
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
		const request = await fetch(
			`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/upsert_page_view`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...supabaseHeaders,
				},
				body: JSON.stringify({
					page_slug: slug,
				}),
			}
		);

		const view_count: number = await request.json();
		return { data: { view_count }, error: null };
	} catch (error) {
		captureException(error);
		return { error, data: null };
	}
}
