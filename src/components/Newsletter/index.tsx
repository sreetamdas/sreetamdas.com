import { NewsletterIssuePreviewProps, NewsletterIssuePreview } from "./Preview";
import { SectionWrapper } from "./styles";

export const NEWSLETTER_DESCRIPTION =
	"Curated links keeping up with the JavaScript, React and webdev world. And mechanical keyboards!";

type NewsletterIssuesProps = {
	issues: Array<NewsletterIssuePreviewProps["issue"]>;
	isAdminUser: NewsletterIssuePreviewProps["isAdminUser"];
};
export const NewsletterIssues = ({ issues, isAdminUser }: NewsletterIssuesProps) => (
	<SectionWrapper>
		{issues.map((issue, index) => (
			<NewsletterIssuePreview key={index} issue={issue} isAdminUser={isAdminUser} />
		))}
	</SectionWrapper>
);
