import { captureException } from "@sentry/nextjs";

import { BUTTONDOWN_EMAIL_MOCKS } from "./mocks";

const BUTTONDOWN_BASE_URL = "https://api.buttondown.email/v1";
const BUTTONDOWN_API_KEY = process.env.BUTTONDOWN_API_KEY;

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
		excluded_tags: Array<unknown>;
		external_url: string;
		id: string;
		included_tags: Array<unknown>;
		metadata: Record<string, unknown>;
		publish_date: string;
		secondary_id: number;
		slug: string;
		subject: string;
	}>;
};

export async function fetchNewsletterEmails(): Promise<ButtondownAPIEmailsResponse> {
	try {
		const response = await fetch(`${BUTTONDOWN_BASE_URL}/emails`, {
			headers: {
				...(BUTTONDOWN_API_KEY !== "" && { Authorization: `Token ${BUTTONDOWN_API_KEY}` }),
			},
			next: {
				revalidate: 86400,
			},
		});
		return await response.json();
	} catch (error: unknown) {
		captureException(error);

		return BUTTONDOWN_EMAIL_MOCKS;
	}
}
