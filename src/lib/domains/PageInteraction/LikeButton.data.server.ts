import "@tanstack/react-start/server-only";
import { env } from "cloudflare:workers";

import { IS_DEV, LIKES_IP_ABUSE_LIMIT, LIKES_SALT_VERSION } from "@/config";
import { getDb } from "@/db";
import { decrementLikes, getLikes, incrementLikes, type LikeCount } from "@/lib/domains/PageViews";

import {
	createSignedLikeCookie,
	getCookieValue,
	hashLikeIp,
	hashLikeVisitor,
	LIKE_ID_COOKIE_NAME,
	readSignedLikeCookie,
	type LikeRequestContext,
} from "./LikeIdentity";

type LikeVisitor = {
	visitorHash: string;
	ipHash?: string;
	saltVersion: number;
	canWrite: boolean;
};

let warnedAboutMissingCookieSecret = false;
let warnedAboutMissingLikesSalt = false;

export async function fetchLikeCountFromDb(
	normalizedSlug: string,
	context: LikeRequestContext = {},
): Promise<LikeCount> {
	const db = getDb();
	const visitor = await getLikeVisitor(normalizedSlug, context);
	const likeCount = await getLikes(db, normalizedSlug, visitor?.visitorHash, visitor?.saltVersion);
	return { ...likeCount, readOnly: !visitor?.canWrite };
}

export async function incrementLikeCountInDb(
	normalizedSlug: string,
	disabled?: boolean,
	context: LikeRequestContext = {},
): Promise<LikeCount> {
	const db = getDb();
	const visitor = await getLikeVisitor(normalizedSlug, context);
	if (disabled || !visitor?.canWrite || !visitor.ipHash) {
		const likeCount = await getLikes(
			db,
			normalizedSlug,
			visitor?.visitorHash,
			visitor?.saltVersion,
		);
		return { ...likeCount, readOnly: !visitor?.canWrite };
	}

	return await incrementLikes(db, normalizedSlug, {
		visitorHash: visitor.visitorHash,
		ipHash: visitor.ipHash,
		saltVersion: visitor.saltVersion,
		abuseLimit: LIKES_IP_ABUSE_LIMIT,
	});
}

export async function decrementLikeCountInDb(
	normalizedSlug: string,
	context: LikeRequestContext = {},
): Promise<LikeCount> {
	if (!IS_DEV) {
		throw new Error("Unliking is only available in local dev");
	}

	const db = getDb();
	const visitor = await getLikeVisitor(normalizedSlug, context);
	if (!visitor) {
		const likeCount = await getLikes(db, normalizedSlug);
		return { ...likeCount, readOnly: true };
	}

	return await decrementLikes(db, normalizedSlug, {
		visitorHash: visitor.visitorHash,
		saltVersion: visitor.saltVersion,
	});
}

async function getLikeVisitor(
	normalizedSlug: string,
	context: LikeRequestContext,
): Promise<LikeVisitor | undefined> {
	const cookieSecret = env.LIKES_COOKIE_SECRET || undefined;
	if (!cookieSecret) {
		warnMissingCookieSecret();
		return undefined;
	}

	const cookieValue = getCookieValue(context.cookieHeader, LIKE_ID_COOKIE_NAME);
	let token = await readSignedLikeCookie(cookieSecret, cookieValue);
	if (!token) {
		const signedCookie = await createSignedLikeCookie(cookieSecret);
		token = signedCookie.token;
		context.setLikeCookie?.(signedCookie.value);
	}

	const ipHash = await getIpHash(normalizedSlug, context.clientIp);
	const visitor: LikeVisitor = {
		visitorHash: await hashLikeVisitor(cookieSecret, token),
		saltVersion: LIKES_SALT_VERSION,
		canWrite: Boolean(ipHash),
	};
	if (ipHash) {
		visitor.ipHash = ipHash;
	}

	return visitor;
}

async function getIpHash(normalizedSlug: string, clientIp?: string): Promise<string | undefined> {
	const ipSalt = env.LIKES_IP_SALT || undefined;
	if (!ipSalt || !clientIp) {
		if (!ipSalt) warnMissingLikesSalt();
		return undefined;
	}

	return await hashLikeIp(ipSalt, LIKES_SALT_VERSION, normalizedSlug, clientIp);
}

function warnMissingCookieSecret(): void {
	if (IS_DEV || warnedAboutMissingCookieSecret) return;

	warnedAboutMissingCookieSecret = true;
	// oxlint-disable-next-line no-console
	console.warn("LIKES_COOKIE_SECRET is not configured; blog likes are read-only.");
}

function warnMissingLikesSalt(): void {
	if (IS_DEV || warnedAboutMissingLikesSalt) return;

	warnedAboutMissingLikesSalt = true;
	// oxlint-disable-next-line no-console
	console.warn("LIKES_IP_SALT is not configured; blog likes are read-only.");
}
