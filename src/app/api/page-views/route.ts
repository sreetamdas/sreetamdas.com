import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { supabaseClient } from "@/lib/domains/Supabase/client";

export const runtime = "edge";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const slug = searchParams.get("slug");

	if (slug === null) {
		return NextResponse.json(
			{ error: 'Request is missing required "slug" param' },
			{ status: 400 }
		);
	} else {
		const { data, error } = await supabaseClient
			.from("page_details")
			.select("view_count")
			.eq("slug", slug)
			.limit(1)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				// TODO add exception handler
				// captureException(error);
				return NextResponse.json(
					{
						view_count: 0,
						message: `Page '${slug}' has not been added to Supabase yet`,
					},
					{ status: 200 }
				);
			} else {
				// TODO add exception handler
				// captureException(error);
				return NextResponse.json({ error }, { status: 500 });
			}
		} else {
			const { view_count } = data;
			return NextResponse.json({ view_count }, { status: 200 });
		}
	}
}
