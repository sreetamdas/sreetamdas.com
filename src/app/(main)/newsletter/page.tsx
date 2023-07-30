import { NewsletterEmailsPreviews } from "./components";
import { fetchNewsletterEmails } from "./helpers";

// import { useSupabaseSession } from "@/domains/Supabase";

export default async function NewsletterEmailsPage() {
	const newsletter_emails_previews_data = await getNewsletterEmailsPreviewsData();

	return (
		<>
			<h1 className="py-10 font-serif text-8xl">/newsletter</h1>
			{/* <NewsletterSignup subscriberCount={subscriberCount} withNewsletter /> */}
			<NewsletterEmailsPreviews emails={newsletter_emails_previews_data} />
		</>
	);
}

function getEmailPreviewContent(content: string) {
	// remove salutation, get two paragraphs
	return content.replace("Hello there!\n", "").split("\n").slice(0, 3).join("\n");
}
async function getNewsletterEmailsPreviewsData() {
	const buttondown_api_emails_response = await fetchNewsletterEmails();

	return buttondown_api_emails_response.results
		.reverse()
		.map(({ body, subject, publish_date, id, secondary_id, slug }) => ({
			slug,
			subject,
			publish_date,
			id,
			secondary_id,
			body: getEmailPreviewContent(body),
		}));
}
