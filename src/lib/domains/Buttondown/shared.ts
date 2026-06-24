export const BUTTONDOWN_BASE_URL = "https://api.buttondown.email/v1";
export const BUTTONDOWN_API_VERSION = "2024-08-15";

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
		status?: string;
		subject: string;
	}>;
};

function isButtondownEmail(
	value: unknown,
): value is ButtondownAPIEmailsResponse["results"][number] {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	return (
		"body" in value &&
		"slug" in value &&
		"subject" in value &&
		typeof value.body === "string" &&
		typeof value.slug === "string" &&
		typeof value.subject === "string"
	);
}

export function isButtondownEmailsResponse(value: unknown): value is ButtondownAPIEmailsResponse {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	if (!("results" in value) || !Array.isArray(value.results)) {
		return false;
	}

	return value.results.every((entry) => isButtondownEmail(entry));
}
