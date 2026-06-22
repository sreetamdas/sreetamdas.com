/**
 * Anonymous like identity helpers. The browser receives only a signed HttpOnly
 * cookie; persisted dedupe/abuse keys are HMAC outputs, not raw tokens or IPs.
 */

const LIKE_COOKIE_PAYLOAD_PREFIX = "like-id";
const LIKE_VISITOR_PAYLOAD_PREFIX = "like-visitor";
const LIKE_IP_PAYLOAD_PREFIX = "like-ip";
const UUID_V4ISH_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const LIKE_ID_COOKIE_NAME = "like_id";
export const LIKE_ID_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 2;

export type LikeRequestContext = {
	clientIp?: string;
	cookieHeader?: string;
	setLikeCookie?: (cookieValue: string) => void;
};

export type SignedLikeCookie = {
	token: string;
	value: string;
};

export async function createSignedLikeCookie(
	secret: string,
	token = crypto.randomUUID(),
): Promise<SignedLikeCookie> {
	const signature = await signBase64Url(secret, cookiePayload(token));
	return { token, value: `${token}.${signature}` };
}

export async function readSignedLikeCookie(
	secret: string,
	cookieValue?: string,
): Promise<string | undefined> {
	if (!cookieValue) return undefined;

	const [token, signature, extra] = cookieValue.split(".");
	if (!token || !signature || extra !== undefined || !UUID_V4ISH_PATTERN.test(token)) {
		return undefined;
	}

	const expectedSignature = await signBase64Url(secret, cookiePayload(token));
	return timingSafeEqual(signature, expectedSignature) ? token : undefined;
}

export function getCookieValue(cookieHeader: string | undefined, name: string): string | undefined {
	if (!cookieHeader) return undefined;

	for (const part of cookieHeader.split(";")) {
		const trimmed = part.trim();
		const equalsAt = trimmed.indexOf("=");
		if (equalsAt === -1) continue;

		const cookieName = trimmed.slice(0, equalsAt);
		if (cookieName === name) {
			return trimmed.slice(equalsAt + 1);
		}
	}

	return undefined;
}

export async function hashLikeVisitor(secret: string, token: string): Promise<string> {
	return signHex(secret, `${LIKE_VISITOR_PAYLOAD_PREFIX}:${token}`);
}

export async function hashLikeIp(
	ipSalt: string,
	saltVersion: number,
	normalizedSlug: string,
	clientIp: string,
): Promise<string> {
	return signHex(ipSalt, `${LIKE_IP_PAYLOAD_PREFIX}:${saltVersion}:${normalizedSlug}:${clientIp}`);
}

async function signBase64Url(secret: string, payload: string): Promise<string> {
	const bytes = await sign(secret, payload);
	return bytesToBase64Url(bytes);
}

async function signHex(secret: string, payload: string): Promise<string> {
	const bytes = await sign(secret, payload);
	return bytesToHex(bytes);
}

async function sign(secret: string, payload: string): Promise<Uint8Array> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
	return new Uint8Array(signature);
}

function cookiePayload(token: string): string {
	return `${LIKE_COOKIE_PAYLOAD_PREFIX}:${token}`;
}

function bytesToHex(bytes: Uint8Array): string {
	return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function bytesToBase64Url(bytes: Uint8Array): string {
	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function timingSafeEqual(left: string, right: string): boolean {
	if (left.length !== right.length) return false;

	let difference = 0;
	for (let index = 0; index < left.length; index += 1) {
		difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
	}
	return difference === 0;
}
