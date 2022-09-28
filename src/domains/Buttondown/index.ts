import axios from "axios";

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

export let allNewsletterIssuesData: ButtondownEmailsType;

export async function getAllButtondownEmails() {
	try {
		if (allNewsletterIssuesData) {
			return allNewsletterIssuesData;
		}
		// TODO: handle paginated results
		const response = (await axiosButtondown.get<ButtondownEmailsType>("/emails")).data;
		if (!allNewsletterIssuesData) {
			allNewsletterIssuesData = response;
		}

		return response;
	} catch (error) {
		throw new Error("Couldn't get Buttondown emails");
	}
}

function getPreviewContent(content: string) {
	return content.replace("Hello there!\n", "").split("\n").slice(0, 3).join("\n");
}
export async function getAllButtondownEmailsPreviews() {
	try {
		const allEmails = await getAllButtondownEmails();
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
	} catch (error) {
		throw new Error("Couldn't get Buttondown emails previews");
	}
}
