import "@tanstack/react-start/server-only";
import { env } from "cloudflare:workers";

import { IS_DEV, LIKES_SALT_VERSION } from "@/config";
import { getDb } from "@/db";
import { getLikes, incrementLikes, type LikeCount } from "@/lib/domains/PageViews";

type Visitor = { hash: string; saltVersion: number };

let warnedAboutMissingLikesSalt = false;

export async function fetchLikeCountFromDb(
	normalizedSlug: string,
	clientIp?: string,
): Promise<LikeCount> {
	const db = getDb();
	const visitor = await getVisitorHash(normalizedSlug, clientIp);
	const likeCount = await getLikes(db, normalizedSlug, visitor?.hash);
	return { ...likeCount, readOnly: !visitor };
}

export async function incrementLikeCountInDb(
	normalizedSlug: string,
	disabled?: boolean,
	clientIp?: string,
): Promise<LikeCount> {
	const db = getDb();
	const visitor = await getVisitorHash(normalizedSlug, clientIp);
	if (disabled || !visitor) {
		const likeCount = await getLikes(db, normalizedSlug, visitor?.hash);
		return { ...likeCount, readOnly: !visitor };
	}
	return await incrementLikes(db, normalizedSlug, visitor.hash, visitor.saltVersion);
}

async function getVisitorHash(
	normalizedSlug: string,
	clientIp?: string,
): Promise<Visitor | undefined> {
	const salt = env.LIKES_IP_SALT || undefined;
	const ip = clientIp;
	if (!salt || !ip) {
		if (!salt && !IS_DEV && !warnedAboutMissingLikesSalt) {
			warnedAboutMissingLikesSalt = true;
			// oxlint-disable-next-line no-console
			console.warn("LIKES_IP_SALT is not configured; blog likes are read-only.");
		}
		return undefined;
	}

	// Bind the salt era into the hash so bumping LIKES_SALT_VERSION yields fresh
	// visitor identities even if the salt itself is reused — a version bump alone
	// can't collide with a prior-era row under onConflictDoNothing.
	const bytes = new TextEncoder().encode(`${salt}:${LIKES_SALT_VERSION}:${normalizedSlug}:${ip}`);
	const hash = await crypto.subtle.digest("SHA-256", bytes);
	const hex = [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");

	return { hash: hex, saltVersion: LIKES_SALT_VERSION };
}
