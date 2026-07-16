/**
 * Cookie-editing Foobar clue. The first request plants a deliberately readable
 * cookie; changing only its value reveals the achievement route.
 */
import { createFileRoute } from "@tanstack/react-router";

import { getCookieValue } from "@/lib/domains/PageInteraction/LikeIdentity";

const FOOBAR_COOKIE_NAME = "foobar-cookie";
const FOOBAR_COOKIE_OPEN_VALUE = "open-sesame";

export function handleFoobarCookie(request: Request): Response {
	const cookieHeader = request.headers.get("cookie") ?? undefined;
	if (getCookieValue(cookieHeader, FOOBAR_COOKIE_NAME) === FOOBAR_COOKIE_OPEN_VALUE) {
		return Response.json({ message: "The jar opened.", foobar: "/foobar/cookie-jar" });
	}

	const attributes = [
		`${FOOBAR_COOKIE_NAME}=sealed`,
		"Path=/api/foobar/cookie",
		"Max-Age=86400",
		"SameSite=Lax",
	];
	if (new URL(request.url).protocol === "https:") attributes.push("Secure");

	return Response.json(
		{ message: "The jar is sealed. Change its value to open-sesame, then ask again." },
		{ headers: { "Set-Cookie": attributes.join("; "), "Cache-Control": "no-store" } },
	);
}

export const Route = createFileRoute("/(api)/api/foobar/cookie")({
	server: {
		handlers: {
			GET: ({ request }) => handleFoobarCookie(request),
		},
	},
});
