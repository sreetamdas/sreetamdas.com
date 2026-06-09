import "@tanstack/react-start/server-only";
import { env } from "cloudflare:workers";

import { IS_DEV } from "@/config";
import { getDb } from "@/db";
import { getLikes, incrementLikes, type LikeCount } from "@/lib/domains/PageViews";

let warnedAboutMissingLikesSalt = false;

export async function fetchLikeCountFromDb(
	normalizedSlug: string,
	clientIp?: string,
): Promise<LikeCount> {
	const db = getDb();
	const visitorHash = await getVisitorHash(normalizedSlug, clientIp);
	return await getLikes(db, normalizedSlug, visitorHash);
}

export async function incrementLikeCountInDb(
	normalizedSlug: string,
	disabled?: boolean,
	clientIp?: string,
): Promise<LikeCount> {
	const db = getDb();
	const visitorHash = await getVisitorHash(normalizedSlug, clientIp);
	if (disabled || !visitorHash) {
		return await getLikes(db, normalizedSlug, visitorHash);
	}
	return await incrementLikes(db, normalizedSlug, visitorHash);
}

async function getVisitorHash(
	normalizedSlug: string,
	clientIp?: string,
): Promise<string | undefined> {
	const salt_value = Reflect.get(env, "LIKES_IP_SALT");
	const salt = typeof salt_value === "string" ? salt_value : undefined;
	const ip = clientIp;
	if (!salt || !ip) {
		if (!salt && !IS_DEV && !warnedAboutMissingLikesSalt) {
			warnedAboutMissingLikesSalt = true;
			// oxlint-disable-next-line no-console
			console.warn("LIKES_IP_SALT is not configured; blog likes are read-only.");
		}
		return undefined;
	}

	const bytes = new TextEncoder().encode(`${salt}:${normalizedSlug}:${ip}`);
	const hash = await crypto.subtle.digest("SHA-256", bytes);

	return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
