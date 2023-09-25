import { IS_DEV } from "@/config";

type PageViewCount = {
	view_count: number;
};

type SuccessResponse<Type = unknown> = { data: Type };
type ErrorResponse<Type = unknown> = {
	errorCode?: number;
	error: Type;
	message?: string;
};
type PageViewCountResponse =
	| (SuccessResponse<PageViewCount> & ErrorResponse<null>)
	| (SuccessResponse<null> & ErrorResponse);

const SUPABASE_ENABLED =
	typeof process.env.NEXT_PUBLIC_SUPABASE_URL !== "undefined" &&
	process.env.NEXT_PUBLIC_SUPABASE_URL !== "" &&
	typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "undefined" &&
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "";

export const SUPABASE_API_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1`;

const supabase_headers = {
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
		if (!SUPABASE_ENABLED) {
			throw new Error("Supabase is not initialized");
		}

		const params = new URLSearchParams({
			slug: `eq.${slug}`,
			select: "view_count",
			limit: "1",
		});

		const request = await fetch(`${SUPABASE_API_BASE_URL}/page_details?${params.toString()}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				...supabase_headers,
			},
			...(!IS_DEV && { cache: "no-store" }),
		});

		const response: Array<PageViewCount> = await request.json();
		const view_count = response[0];

		if (typeof view_count === "undefined")
			throw new Error("Page has not been added to the database yet", { cause: { view_count } });

		return { data: view_count, error: null };
	} catch (error) {
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
		if (!SUPABASE_ENABLED) {
			throw new Error("Supabase is not initialized");
		}

		const request = await fetch(`${SUPABASE_API_BASE_URL}/rpc/upsert_page_view`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...supabase_headers,
			},
			cache: "no-store",
			body: JSON.stringify({
				page_slug: slug,
			}),
		});

		const view_count: number = await request.json();
		return { data: { view_count }, error: null };
	} catch (error) {
		return { error, data: null };
	}
}
