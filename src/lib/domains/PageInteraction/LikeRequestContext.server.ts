import "@tanstack/react-start/server-only";
import { getRequestHeader, setCookie } from "@tanstack/react-start/server";

import {
	LIKE_ID_COOKIE_MAX_AGE_SECONDS,
	LIKE_ID_COOKIE_NAME,
	type LikeRequestContext,
} from "./LikeIdentity";

export function getLikeRequestContext(): LikeRequestContext {
	const clientIp = getRequestHeader("cf-connecting-ip");
	const cookieHeader = getRequestHeader("cookie");
	const context: LikeRequestContext = {
		setLikeCookie: (cookieValue) => {
			setCookie(LIKE_ID_COOKIE_NAME, cookieValue, {
				httpOnly: true,
				secure: true,
				sameSite: "lax",
				path: "/",
				maxAge: LIKE_ID_COOKIE_MAX_AGE_SECONDS,
			});
		},
	};

	if (clientIp) {
		context.clientIp = clientIp;
	}
	if (cookieHeader) {
		context.cookieHeader = cookieHeader;
	}

	return context;
}
