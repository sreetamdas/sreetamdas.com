/**
 * Cookie-editing Foobar clue. The first request plants a deliberately readable
 * cookie; changing only its value reveals the achievement route.
 */
import { createFileRoute } from "@tanstack/react-router";

const FOOBAR_COOKIE_NAME = "foobar-cookie";
const FOOBAR_COOKIE_OPEN_VALUE = "open-sesame";

export function handleFoobarCookie(request: Request): Response {
	if (readCookie(request.headers.get("cookie"), FOOBAR_COOKIE_NAME) === FOOBAR_COOKIE_OPEN_VALUE) {
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

function readCookie(header: string | null, name: string): string | undefined {
	if (!header) return undefined;

	for (const part of header.split(";")) {
		const separator = part.indexOf("=");
		if (separator < 0) continue;
		if (part.slice(0, separator).trim() !== name) continue;
		return part.slice(separator + 1).trim();
	}

	return undefined;
}

export const Route = createFileRoute("/(api)/api/foobar/cookie")({
	server: {
		handlers: {
			GET: ({ request }) => handleFoobarCookie(request),
		},
	},
});
