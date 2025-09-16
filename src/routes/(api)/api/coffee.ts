import { createServerFileRoute } from "@tanstack/react-start/server";
import { NextResponse } from "next/server";

export function POST() {
	return NextResponse.json(
		{ message: "Cannot brew coffee, I'm a teapot", foobar: "/foobar/teapot" },
		{ status: 418 },
	);
}

export function GET() {
	return NextResponse.json({}, { status: 405, headers: { Allow: "POST" } });
}

export const ServerRoute = createServerFileRoute("/(api)/api/coffee").methods({
	GET: () => {
		return new Response(JSON.stringify({}), { status: 405, headers: { Allow: "POST" } });
	},
	POST: () => {
		return new Response(
			JSON.stringify({ message: "Cannot brew coffee, I'm a teapot", foobar: "/foobar/teapot" }),
			{ status: 418 },
		);
	},
});
