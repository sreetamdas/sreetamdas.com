import { BUTTONDOWN_EMAIL_MOCKS } from "./-mocks";
const BUTTONDOWN_BASE_URL = "https://api.buttondown.email/v1";

export function getButtondownApiKey(env: CloudflareEnv): string | undefined {
	const values = env as unknown as Record<string, unknown>;
	for (const key of ["VITE_BUTTONDOWN_API_KEY", "BUTTONDOWN_API_KEY"]) {
		const value = values[key];
		if (typeof value === "string" && value.length > 0) {
			return value;
		}
	}
	// Fallback to process.env for build-time / prerender environments
	for (const key of ["VITE_BUTTONDOWN_API_KEY", "BUTTONDOWN_API_KEY"]) {
		const value = process.env[key];
		if (typeof value === "string" && value.length > 0) {
			return value;
		}
	}
	return undefined;
}

export type ButtondownAPISubscribersResponse = {
	count: number;
	next: string;
	previous: string;
	results: Array<{
		creation_date: string;
		email: string;
		id: string;
		notes: string;
		referrer_url: string;
		metadata: Record<string, unknown>;
		secondary_id: number;
		subscriber_type: string;
		source: string;
		tags: Array<string>;
		utm_campaign: string;
		utm_medium: string;
		utm_source: string;
	}>;
};

export type ButtondownAPIEmailsResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: Array<{
		body: string;
		email_type: string;
		excluded_tags: Array<object>;
		external_url: string;
		id: string;
		included_tags: Array<object>;
		metadata: Record<string, object>;
		publish_date: string;
		secondary_id: number;
		slug: string;
		subject: string;
	}>;
};

export async function fetchNewsletterEmails(apiKey?: string): Promise<ButtondownAPIEmailsResponse> {
	try {
		const response = await fetch(`${BUTTONDOWN_BASE_URL}/emails`, {
			headers: {
				...(apiKey && {
					"X-API-Version": "2024-08-15",
					Authorization: `Token ${apiKey}`,
				}),
			},
		});
		if (!response.ok) {
			return BUTTONDOWN_EMAIL_MOCKS as ButtondownAPIEmailsResponse;
		}
		return (await response.json()) as ButtondownAPIEmailsResponse;
	} catch (_error: unknown) {
		return BUTTONDOWN_EMAIL_MOCKS as ButtondownAPIEmailsResponse;
	}
}
