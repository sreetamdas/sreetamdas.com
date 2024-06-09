import { isEmpty, isNull } from "lodash-es";
import { type NextRequest, NextResponse } from "next/server";

import { getPageViews, upsertPageViews, type PageViewCount } from "@/lib/domains/db/page-views";

type MaybeErrorResponse<SuccessResult> = NextResponse<
	SuccessResult | { data: null; error: { message: string; cause: string } }
>;

export async function POST(request: NextRequest): Promise<MaybeErrorResponse<PageViewCount>> {
	try {
		const { slug } = await request.json<{ slug: string | null }>();

		if (isNull(slug) || isEmpty(slug)) {
			throw new Error("Page slug param is missing", { cause: { slug } });
		}

		const result = await upsertPageViews(slug);

		if (result.type === "error") {
			throw new Error(result?.error?.message, { cause: result.error?.cause });
		}
		return NextResponse.json(result.data);
	} catch (error) {
		return NextResponse.json(
			// @ts-expect-error error shape
			{ error: { message: error.message, cause: error.cause }, data: null },
			{ status: 400 },
		);
	}
}

export async function GET(request: NextRequest): Promise<MaybeErrorResponse<PageViewCount>> {
	try {
		const slug = request.nextUrl.searchParams.get("slug");

		if (isNull(slug) || isEmpty(slug)) {
			throw new Error("Page slug param is missing", { cause: { slug } });
		}

		const result = await getPageViews(slug);
		if (result.type === "error") {
			throw new Error(result?.error?.message, { cause: result.error?.cause });
		}
		return NextResponse.json(result.data);
	} catch (error) {
		return NextResponse.json(
			// @ts-expect-error error shape
			{ error: { message: error.message, cause: error.cause }, data: null },
			{ status: 400 },
		);
	}
}
