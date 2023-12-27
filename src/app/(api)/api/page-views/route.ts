import { isEmpty, isNull } from "lodash-es";
import { type NextRequest, NextResponse } from "next/server";

import { getPageViews, upsertPageViews } from "@/lib/domains/Supabase";

export const runtime = "edge";

export async function POST(request: NextRequest) {
	try {
		const { slug } = await request.json();

		if (isNull(slug) || isEmpty(slug)) {
			throw new Error("Page slug param is missing", { cause: { slug } });
		}

		const page_views = await upsertPageViews(slug);
		return NextResponse.json(page_views);
	} catch (error) {
		return NextResponse.json(
			// @ts-expect-error error shape
			{ error: { message: error.message, cause: error.cause }, data: null },
			{ status: 400 },
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const slug = request.nextUrl.searchParams.get("slug");

		if (isNull(slug) || isEmpty(slug)) {
			throw new Error("Page slug param is missing", { cause: { slug } });
		}

		const page_views = await getPageViews(slug);
		return NextResponse.json(page_views);
	} catch (error) {
		return NextResponse.json(
			// @ts-expect-error error shape
			{ error: { message: error.message, cause: error.cause }, data: null },
			{ status: 400 },
		);
	}
}
