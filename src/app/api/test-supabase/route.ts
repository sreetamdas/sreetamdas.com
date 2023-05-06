/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { Database } from "@/lib/domains/Supabase/database.types";

export const runtime = "edge";

const supabaseClient = createClient<Database>(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(_: NextRequest, { params: { slug } }: { params: { slug: string } }) {
	const methods = [
		["JS client", () => fetchViewsSupabaseClient(slug!)],
		["API", () => fetchViewsSupabaseAPI(slug!)],
		["Deno functions", () => fetchViewsSupabaseEdgeFunctions(slug!)],
	];

	try {
		// Call each method once to warm up
		// @ts-expect-error call
		await Promise.all(methods.map(([_, method]) => method.call(null)));

		// Call each method again and time each promise individually
		const results = await Promise.all(
			methods.map(async ([fn_name, method]) => {
				const startTime = Date.now();
				// @ts-expect-error call
				const { data } = await method.call(null);
				const endTime = Date.now();
				return { name: fn_name, time: endTime - startTime, data };
			})
		);

		return NextResponse.json(results);
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(error);
	}
}

async function fetchViewsSupabaseClient(slug: string) {
	const { data, error } = await supabaseClient!
		.from("page_details")
		.select("view_count")
		.eq("slug", slug)
		.limit(1)
		.single();

	return { data, error };
}
async function fetchViewsSupabaseAPI(slug: string) {
	const request = await fetch(
		`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/page_details?slug=eq.${slug}&select=view_count&limit=1`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				apiKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
				Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
			},
			cache: "no-cache",
		}
	);

	const response = await request.json();
	const view_count = response[0];

	return { data: view_count, error: null };
}
async function fetchViewsSupabaseEdgeFunctions(slug: string) {
	const request = await fetch(
		`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/page-views?slug=${slug}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				apiKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
				Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
			},
		}
	);

	const data = await request.json();

	return { data, error: null };
}
