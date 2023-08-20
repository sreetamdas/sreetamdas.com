import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST() {
	return NextResponse.json(
		{ message: "Cannot brew coffeee, I'm a teapot", foobar: "/foobar/teapot" },
		{ status: 418 },
	);
}

export async function GET() {
	return NextResponse.json({}, { status: 405, headers: { Allow: "POST" } });
}
