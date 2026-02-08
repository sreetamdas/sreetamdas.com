import { NewsletterEmailDetail } from "./-components";
import { fetchNewsletterEmails } from "./-helpers";
import { createFileRoute, notFound } from "@tanstack/react-router";

export const dynamicParams = false;

// export async function generateStaticParams() {
// 	const newsletter_emails_slugs = await getNewsletterEmailsSlugs();

// 	return newsletter_emails_slugs;
// }

// export async function generateMetadata(props: PageProps): Promise<Metadata> {
// 	const params = await props.params;

// 	const { slug } = params;

// 	const newsletter_email_data = await getNewsletterEmailsDataBySlug(slug);

// 	return {
// 		title: newsletter_email_data.subject,
// 	};
// }

export const Route = createFileRoute("/(main)/newsletter/$slug")({
  component: NewsletterEmailDetailPage,
  loader: async ({ params: { slug } }) => {
    const buttondown_api_emails_response = await fetchNewsletterEmails();
    const newsletter_email_by_slug =
      buttondown_api_emails_response.results.find(
        (issue) => issue.slug === slug,
      );

    if (typeof newsletter_email_by_slug === "undefined") {
      // eslint-disable-next-line no-console
      console.error("Newsletter email not found", "warning");
      throw notFound();
    }

    /**
     * Buttondown now includes a `<!-- buttondown-editor-mode: plaintext -->` at the start of the
     * email body, that is cannot be processed by micromark
     */
    const trimmed_email_body = newsletter_email_by_slug.body.replace(
      "<!-- buttondown-editor-mode: plaintext -->",
      "",
    );

    const newsletter_email_data = {
      ...newsletter_email_by_slug,
      body: trimmed_email_body,
    } as any;
    return { newsletter_email_data };
  },
  notFoundComponent: () => (
    <>
      <h1>Not Found</h1>
      <p>
        The newsletter issue/email you&apos;re trying to find doesn&apos;t exist
        :/
      </p>
    </>
  ),
});

function NewsletterEmailDetailPage() {
  const { newsletter_email_data } = Route.useLoaderData();

  return <NewsletterEmailDetail email={newsletter_email_data} />;
}

// async function getNewsletterEmailsSlugs() {
// 	const buttondown_api_emails_response = await fetchNewsletterEmails();

// 	return buttondown_api_emails_response.results.map(({ slug }) => ({ slug }));
// }
