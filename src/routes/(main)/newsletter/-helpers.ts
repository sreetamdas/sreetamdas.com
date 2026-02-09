import { BUTTONDOWN_EMAIL_MOCKS } from "./-mocks";
import { createServerFn } from "@tanstack/react-start";
const BUTTONDOWN_BASE_URL = "https://api.buttondown.email/v1";
const BUTTONDOWN_API_KEY = import.meta.env.VITE_BUTTONDOWN_API_KEY;

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

export const fetchNewsletterEmails = createServerFn({
	method: "GET",
}).handler(async (): Promise<ButtondownAPIEmailsResponse> => {
	try {
		const response = await fetch(`${BUTTONDOWN_BASE_URL}/emails`, {
			headers: {
				...(BUTTONDOWN_API_KEY !== "" && {
					"X-API-Version": "2024-08-15",
					Authorization: `Token ${BUTTONDOWN_API_KEY}`,
				}),
				"Access-Control-Allow-Origin": "*",
			},
		});
		return (await response.json()) as ButtondownAPIEmailsResponse;
	} catch (_error: unknown) {
		return BUTTONDOWN_EMAIL_MOCKS as ButtondownAPIEmailsResponse;
	}
});
