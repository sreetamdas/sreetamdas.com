import { createFileRoute } from "@tanstack/react-router";

import { SITE_TITLE_APPEND } from "@/config";
import { canonicalUrl } from "@/lib/seo";

const PATH = "/privacy/budget-statement-reader";
const TITLE = "Budget Statement Reader privacy policy";
const DESCRIPTION =
	"How the Budget Statement Reader, a private single-user Gmail read-only tool, handles data.";

export const Route = createFileRoute("/(pure)/privacy/budget-statement-reader")({
	component: PrivacyPage,
	head: () => ({
		links: [{ rel: "canonical", href: canonicalUrl(PATH) }],
		meta: [
			{ title: `${TITLE} ${SITE_TITLE_APPEND}` },
			{ name: "description", content: DESCRIPTION },
			{ name: "robots", content: "noindex" },
			{ property: "og:title", content: TITLE },
			{ property: "og:description", content: DESCRIPTION },
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: canonicalUrl(PATH) },
		],
	}),
});

function PrivacyPage() {
	return (
		<div className="px-2">
			<article className="mx-auto my-5 max-w-2xl space-y-4">
				<h1 className="text-2xl font-bold tracking-tight">
					Budget Statement Reader: privacy policy
				</h1>
				<p className="text-sm">Last updated 15 November 2026</p>

				<h2 className="pt-2 text-xl font-bold">What this is</h2>
				<p>
					Budget Statement Reader is a private tool for one person&apos;s household budgeting. It is
					not published, distributed or offered to anyone else. It is run by Sreetam Das (
					<a className="link-base" href="https://sreetamdas.com">
						sreetamdas.com
					</a>
					) for the personal use of the single Google account holder who authorises it.
				</p>

				<h2 className="pt-2 text-xl font-bold">What it accesses</h2>
				<p>
					With the account holder&apos;s consent it requests one permission:{" "}
					<code>https://www.googleapis.com/auth/gmail.readonly</code> (read-only access to email).
					It cannot send, change or delete email. It looks only for messages from HDFC Bank, namely
					transaction alerts and account and card statements, and ignores everything else.
				</p>

				<h2 className="pt-2 text-xl font-bold">How the data is used</h2>
				<p>
					Transaction details (date, amount, merchant, last digits of the account or card) are read
					from those messages and entered into the account holder&apos;s own budgeting file. They
					are used for nothing else: not for advertising, not sold, and not shared with anyone.
					Message content may be processed by software the account holder chooses to run on their
					own computer to help extract transactions.
				</p>

				<h2 className="pt-2 text-xl font-bold">Where it is stored</h2>
				<p>
					The access token is kept in the operating system&apos;s keychain on the account
					holder&apos;s computer. Extracted transactions are stored in a self-hosted budgeting
					server run by the same person. No copy of the mailbox is kept.
				</p>

				<h2 className="pt-2 text-xl font-bold">Google API Services User Data Policy</h2>
				<p>
					The use and transfer of information received from Google APIs adheres to the{" "}
					<a
						className="link-base"
						href="https://developers.google.com/terms/api-services-user-data-policy"
						target="_blank"
						rel="noreferrer"
					>
						Google API Services User Data Policy
					</a>
					, including the Limited Use requirements.
				</p>

				<h2 className="pt-2 text-xl font-bold">Revoking access and deletion</h2>
				<p>
					Access can be withdrawn at any time at{" "}
					<a
						className="link-base"
						href="https://myaccount.google.com/permissions"
						target="_blank"
						rel="noreferrer"
					>
						myaccount.google.com/permissions
					</a>
					. Doing so invalidates the token; deleting the budgeting file removes the extracted
					transactions.
				</p>

				<h2 className="pt-2 text-xl font-bold">Contact</h2>
				<p>
					Questions about this policy can be sent via{" "}
					<a className="link-base" href="https://sreetamdas.com">
						sreetamdas.com
					</a>
					.
				</p>
			</article>
		</div>
	);
}
