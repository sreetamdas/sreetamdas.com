import { micromark } from "micromark";
import { HiOutlineCalendar, HiOutlineNewspaper } from "react-icons/hi";

import {
	PreviewWrapper,
	PreviewSubject,
	PreviewBody,
	ExtraInfoWrapper,
	PreviewMetadata,
	IconContainer,
} from "./styles";

import { ButtondownEmailsType, BUTTONDOWN_EMAIL_STATS_URL_PREFIX } from "@/domains/Buttondown";
import { LinkTo } from "@/styles/typography";

type IssueDefaultFields = ButtondownEmailsType["results"][number];

export type IssuePreviewProps = Pick<IssueDefaultFields, "body" | "slug" | "subject"> & {
	id: IssueDefaultFields["id"];
	secondaryID: IssueDefaultFields["secondary_id"];
	publishDate: IssueDefaultFields["publish_date"];
};

export type NewsletterIssuePreviewProps = {
	issue: IssuePreviewProps;
	isAdminUser?: boolean;
};
export const NewsletterIssuePreview = ({ issue, isAdminUser }: NewsletterIssuePreviewProps) => (
	<PreviewWrapper>
		<PreviewSubject>
			<LinkTo href={`/newsletter/${issue.slug}`} scroll={false} passHref $unstyledOnHover>
				{issue.subject}
			</LinkTo>
		</PreviewSubject>
		<PreviewBody dangerouslySetInnerHTML={{ __html: micromark(issue.body) }}></PreviewBody>
		<ExtraInfoWrapper>
			<PreviewMetadata>
				<IconContainer>
					<HiOutlineNewspaper /> #{issue.secondaryID}
				</IconContainer>
				<IconContainer>
					<HiOutlineCalendar />{" "}
					{new Date(issue.publishDate).toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
				</IconContainer>
				{isAdminUser && (
					<LinkTo href={`${BUTTONDOWN_EMAIL_STATS_URL_PREFIX}/${issue.id}`} target="_blank">
						Stats
					</LinkTo>
				)}
			</PreviewMetadata>
		</ExtraInfoWrapper>
	</PreviewWrapper>
);
