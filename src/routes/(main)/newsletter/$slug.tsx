import { NewsletterEmailDetail } from "./-components";
import { fetchNewsletterEmails } from "./-helpers";
import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/(main)/newsletter/$slug")({
  component: NewsletterEmailDetailPage,
  loader: async ({ params: { slug } }) => {
    const buttondown_api_emails_response = await fetchNewsletterEmails();
    const newsletter_email_by_slug =
      buttondown_api_emails_response.results.find(
        (issue) => issue.slug === slug,
      );

    if (typeof newsletter_email_by_slug === "undefined") {
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
