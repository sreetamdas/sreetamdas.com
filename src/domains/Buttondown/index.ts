import { captureException } from "@sentry/nextjs";
import axios from "axios";

import { dog } from "@/utils/helpers";

const BUTTONDOWN_BASE_URL = "https://api.buttondown.email/v1";
const BUTTONDOWN_API_KEY = process.env.BUTTONDOWN_API_KEY;
export const BUTTONDOWN_EMAIL_STATS_URL_PREFIX = "https://buttondown.email/emails/analytics";

const axiosButtondown = axios.create({
	baseURL: BUTTONDOWN_BASE_URL,
	headers: {
		Authorization: `Token ${BUTTONDOWN_API_KEY}`,
	},
});

type ButtondownSubscribersType = {
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

export type ButtondownEmailsType = {
	count: number;
	next: string;
	previous: string;
	results: Array<{
		body: string;
		email_type: "public";
		excluded_tags: [];
		external_url: string;
		id: string;
		included_tags: [];
		metadata: Record<string, unknown>;
		publish_date: string;
		secondary_id: number;
		slug: string;
		subject: string;
	}>;
};

export async function getButtondownSubscriberCount() {
	try {
		const response = (
			await axiosButtondown.get<ButtondownSubscribersType>("/subscribers", {
				params: { type: "regular" },
			})
		).data;
		return response.count;
	} catch (error) {
		return 69;
	}
}

async function getButtondownNewsletterEmails() {
	try {
		dog("MAKING REQUEST");
		const response = (await axiosButtondown.get<ButtondownEmailsType>("/emails")).data;
		return response;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		captureException(error);
		throw new Error("Couldn't get Buttondown emails", error);
	}
}

let allNewsletterIssuesData: ButtondownEmailsType | null = null;
export async function getAllNewsletterIssuesData(where: string) {
	if (allNewsletterIssuesData) {
		return allNewsletterIssuesData;
	}
	try {
		dog("BUTTONDOWN GET", where);
		const response = await getButtondownNewsletterEmails();
		dog("CACHING");
		allNewsletterIssuesData = response;

		return allNewsletterIssuesData;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		captureException(error);
		throw new Error("Couldn't get Buttondown emails", error);
	}
}

export async function getAllButtondownEmails(where: string) {
	try {
		const response = await getAllNewsletterIssuesData(where);

		return response;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		captureException(error);
		throw new Error("Couldn't get Buttondown emails", error);
	}
}

function getPreviewContent(content: string) {
	// remove salutation, get two paragraphs
	return content.replace("Hello there!\n", "").split("\n").slice(0, 3).join("\n");
}
export async function getAllButtondownEmailsPreviews() {
	const allEmails = await getAllButtondownEmails("preview");
	return [...allEmails.results]
		.reverse()
		.map(({ body, subject, publish_date, id, secondary_id, slug }) => ({
			slug,
			subject,
			publishDate: publish_date,
			id: id,
			secondaryID: secondary_id,
			body: getPreviewContent(body),
		}));
}

export async function getLatestButtondownEmailSlug() {
	const allEmails = await getAllButtondownEmails("latest slug");

	return [...allEmails.results].reverse()[0]?.slug;
}
