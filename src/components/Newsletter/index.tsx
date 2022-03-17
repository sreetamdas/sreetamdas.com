import { micromark } from "micromark";
import { HiOutlineCalendar, HiOutlineNewspaper } from "react-icons/hi";

import {
	SectionWrapper,
	PreviewWrapper,
	PreviewSubject,
	PreviewBody,
	ExtraInfoWrapper,
	PreviewMetadata,
	IconContainer,
} from "./styles";

import { ButtondownEmailsType } from "@/domains/Buttondown";
import { LinkTo } from "@/styles/typography";

type IssueDefaultFields = ButtondownEmailsType["results"][number];
type IssuePreviewProps = Pick<IssueDefaultFields, "body" | "slug" | "subject"> & {
	id: IssueDefaultFields["id"];
	secondaryID: IssueDefaultFields["secondary_id"];
	publishDate: IssueDefaultFields["publish_date"];
};

type NewsletterIssuePreviewProps = {
	issue: IssuePreviewProps;
};
const NewsletterIssuePreview = ({ issue }: NewsletterIssuePreviewProps) => (
	<PreviewWrapper>
		<LinkTo href={`/newsletter/${issue.slug}`}>
			<PreviewSubject>{issue.subject}</PreviewSubject>
		</LinkTo>
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
			</PreviewMetadata>
		</ExtraInfoWrapper>
	</PreviewWrapper>
);

type NewsletterIssuesProps = {
	issues: Array<IssuePreviewProps>;
};
export const NewsletterIssues = ({ issues }: NewsletterIssuesProps) => (
	<SectionWrapper>
		{issues.map((issue, index) => (
			<NewsletterIssuePreview key={index} issue={issue} />
		))}
	</SectionWrapper>
);
