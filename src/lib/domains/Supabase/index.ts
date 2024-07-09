import { IS_DEV } from "@/config";

type PageViewCount = {
	view_count: number;
};

type PageDetail = PageViewCount & {
	id: number;
	slug: string;
	likes: number;
	created_at: string;
	updated_at: string;
};

type SuccessResponse<Type = undefined> = { data: Type };
type ErrorResponse<Type = undefined> = {
	error?: Type;
};
type PageViewCountResponse =
	| (SuccessResponse<PageViewCount> & ErrorResponse & { type: "success" })
	| ((SuccessResponse & ErrorResponse<{ message: string; cause: string }>) & { type: "error" });

type PageDetailsResponse =
	| (SuccessResponse<Array<PageDetail>> & ErrorResponse & { type: "success" })
	| ((SuccessResponse & ErrorResponse<{ message: string; cause: string }>) & { type: "error" });

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

		// eslint-disable-next-line no-console
		console.log("GET", slug);

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

		if (typeof view_count === "undefined") {
			throw new Error("Page has not been added to the database yet", {
				cause: { view_count: "undefined" },
			});
		}

		return { data: view_count, type: "success" };
	} catch (error) {
		// @ts-expect-error error shape
		return { error: { message: error.message, cause: error.cause }, type: "error" };
	}
}

/**
 * Get all pages' view_count
 */
export async function getAllPageViews(): Promise<PageDetailsResponse> {
	try {
		if (!SUPABASE_ENABLED) {
			throw new Error("Supabase is not initialized");
		}

		const request = await fetch(`${SUPABASE_API_BASE_URL}/page_details?select=*`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				...supabase_headers,
			},
			...(!IS_DEV && { cache: "no-store" }),
		});

		const response: Array<PageDetail> = await request.json();

		if (typeof response === "undefined") {
			throw new Error("Page has not been added to the database yet", {
				cause: { response: "undefined" },
			});
		}

		return { data: response, type: "success" };
	} catch (error) {
		// @ts-expect-error error shape
		return { error: { message: error.message, cause: error.cause }, type: "error" };
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

		// eslint-disable-next-line no-console
		console.log("UPSERT", slug);

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

		if (typeof view_count === "undefined") {
			throw new Error("Page has not been added to the database yet", {
				cause: { view_count: "undefined" },
			});
		}

		return { data: { view_count }, type: "success" };
	} catch (error) {
		// @ts-expect-error error shape
		return { error: { message: error.message, cause: error.cause }, type: "error" };
	}
}
