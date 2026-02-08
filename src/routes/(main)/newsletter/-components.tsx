import { HiOutlineCalendar, HiOutlineNewspaper } from "react-icons/hi";

import { LinkTo } from "@/lib/components/Anchor";
import { MDXContent } from "@/lib/components/MDX";
import { ViewsCounter } from "@/lib/components/ViewsCounter";

import { type ButtondownAPIEmailsResponse } from "./-helpers";

export const BUTTONDOWN_EMAIL_STATS_URL_PREFIX =
  "https://buttondown.email/emails/analytics";

type NewsletterEmailDefaultFields =
  ButtondownAPIEmailsResponse["results"][number];

type EmailPreviewProps = Pick<
  NewsletterEmailDefaultFields,
  "body" | "slug" | "subject"
> & {
  id: NewsletterEmailDefaultFields["id"];
  secondary_id: NewsletterEmailDefaultFields["secondary_id"];
  publish_date: NewsletterEmailDefaultFields["publish_date"];
};

type NewsletterEmailPreviewProps = {
  email: EmailPreviewProps;
  isAdminUser?: boolean;
};
const NewsletterEmailPreview = ({
  email,
  isAdminUser = false,
}: NewsletterEmailPreviewProps) => (
  <article>
    <h2 className="text-primary p-0 font-sans text-2xl font-bold">
      <LinkTo href={`/newsletter/$slug`} params={{ slug: email.slug }}>
        {email.subject}
      </LinkTo>
    </h2>

    <div className="mask-[linear-gradient(to_bottom,black_50%,transparent_100%)]">
      <MDXContent source={email.body} />
    </div>
    <div className="grid grid-cols-[1fr_max-content] justify-between pt-2.5">
      <span className="flex items-center justify-end gap-5">
        <span className="flex gap-1.5 text-base">
          <HiOutlineNewspaper className="text-2xl" /> #{email.secondary_id}
        </span>
        <span className="flex gap-1.5 text-base">
          <HiOutlineCalendar className="text-2xl" />{" "}
          {new Date(email.publish_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
        {isAdminUser && (
          <a
            className="link-base"
            href={`${BUTTONDOWN_EMAIL_STATS_URL_PREFIX}/${email.id}`}
            target="_blank"
          >
            Stats
          </a>
        )}
      </span>
    </div>
  </article>
);

type NewsletterEmailsPreviewsProps = {
  emails: Array<NewsletterEmailPreviewProps["email"]>;
  // TODO add adminUser for newsletter stats' link
  // isAdminUser: NewsletterEmailPreviewProps["isAdminUser"];
};
export const NewsletterEmailsPreviews = ({
  emails,
}: NewsletterEmailsPreviewsProps) => (
  <section className="grid gap-20">
    {emails.map((email, index) => (
      <NewsletterEmailPreview key={index} email={email} />
    ))}
  </section>
);

type NewsletterEmailDetailProps = {
  email: ButtondownAPIEmailsResponse["results"][number] & {
    body: string;
  };
};
export const NewsletterEmailDetail = ({
  email,
}: NewsletterEmailDetailProps) => {
  const { body } = email;

  return (
    <section>
      <article>
        <h1 className="pt-20 font-serif text-6xl font-bold tracking-tighter">
          {email.subject}
        </h1>
        <div className="mt-5 mb-12 flex justify-end gap-5">
          <span className="flex items-center gap-1.5 text-base">
            <HiOutlineNewspaper className="text-2xl" /> #{email.secondary_id}
          </span>
          <span className="flex items-center gap-1.5 text-base">
            <HiOutlineCalendar className="text-2xl" />{" "}
            {new Date(email.publish_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        <MDXContent source={body} />
      </article>
      <ViewsCounter slug={`/newsletter/${email.slug}`} />
    </section>
  );
};
