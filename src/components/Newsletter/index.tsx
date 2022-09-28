import { IssuePreviewProps, NewsletterIssuePreview } from "./Preview";
import { SectionWrapper } from "./styles";

type NewsletterIssuesProps = {
	issues: Array<IssuePreviewProps>;
	isAdminUser: boolean;
};
export const NewsletterIssues = ({ issues, isAdminUser }: NewsletterIssuesProps) => (
	<SectionWrapper>
		{issues.map((issue, index) => (
			<NewsletterIssuePreview key={index} issue={issue} isAdminUser={isAdminUser} />
		))}
	</SectionWrapper>
);
