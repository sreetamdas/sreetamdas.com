/**
 * Buttondown API boundary for newsletter routes. It keeps the private API key
 * server-only and falls back to checked-in mocks so static builds/previews can
 * still render when Buttondown is unavailable or not configured.
 */
import { env } from "cloudflare:workers";

import { BUTTONDOWN_EMAIL_MOCKS } from "./mocks";
import newsletterSnapshot from "./newsletter-snapshot.json";
import {
	BUTTONDOWN_API_VERSION,
	BUTTONDOWN_BASE_URL,
	type ButtondownAPIEmailsResponse,
	isButtondownEmailsResponse,
} from "./shared";

const BUTTONDOWN_PLAINTEXT_MARKER = "<!-- buttondown-editor-mode: plaintext -->";

export function getButtondownApiKey(): string | undefined {
	return env.BUTTONDOWN_API_KEY || undefined;
}

export function stripButtondownPlaintextMarker(body: string) {
	return body.replace(BUTTONDOWN_PLAINTEXT_MARKER, "");
}

export type { ButtondownAPIEmailsResponse, ButtondownAPISubscribersResponse } from "./shared";

/**
 * Returns the committed newsletter snapshot when it holds issues, otherwise
 * `undefined`. The published issues no longer change, so the snapshot lets the
 * build/prerender skip the live Buttondown request. Refresh it with
 * `pnpm snapshot:newsletter`.
 */
export function getNewsletterSnapshot(): ButtondownAPIEmailsResponse | undefined {
	return isButtondownEmailsResponse(newsletterSnapshot) && newsletterSnapshot.results.length > 0
		? newsletterSnapshot
		: undefined;
}

export async function fetchNewsletterEmails(
	apiKey?: string,
	/**
	 * Snapshot override. Omit to use the committed snapshot; pass `null` to
	 * force the live API / mock path (used in tests).
	 */
	snapshotOverride?: ButtondownAPIEmailsResponse | null,
): Promise<ButtondownAPIEmailsResponse> {
	const snapshot = snapshotOverride === undefined ? getNewsletterSnapshot() : snapshotOverride;
	if (snapshot && snapshot.results.length > 0) {
		return snapshot;
	}

	if (!apiKey) {
		return BUTTONDOWN_EMAIL_MOCKS;
	}

	try {
		const response = await fetch(`${BUTTONDOWN_BASE_URL}/emails`, {
			headers: {
				"X-API-Version": BUTTONDOWN_API_VERSION,
				Authorization: `Token ${apiKey}`,
			},
		});
		if (!response.ok) {
			return BUTTONDOWN_EMAIL_MOCKS;
		}

		const data = await response.json();
		if (!isButtondownEmailsResponse(data)) {
			return BUTTONDOWN_EMAIL_MOCKS;
		}

		return data;
	} catch (_error: unknown) {
		return BUTTONDOWN_EMAIL_MOCKS;
	}
}
