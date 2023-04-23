import { NewsletterEmailsPreviews } from "./components";
import { fetchNewsletterEmails } from "./helpers";

// import { useSupabaseSession } from "@/domains/Supabase";

export default async function NewsletterEmailsPage() {
	const newsletterEmailsPreviewsData = await getNewsletterEmailsPreviewsData();

	return (
		<>
			<h1 className="py-10 font-serif text-8xl">/newsletter</h1>
			{/* <NewsletterSignup subscriberCount={subscriberCount} withNewsletter /> */}
			<NewsletterEmailsPreviews emails={newsletterEmailsPreviewsData} />
		</>
	);
}

function getEmailPreviewContent(content: string) {
	// remove salutation, get two paragraphs
	return content.replace("Hello there!\n", "").split("\n").slice(0, 3).join("\n");
}
async function getNewsletterEmailsPreviewsData() {
	const buttondownAPIEmailsResponse = await fetchNewsletterEmails();

	return buttondownAPIEmailsResponse.results
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
