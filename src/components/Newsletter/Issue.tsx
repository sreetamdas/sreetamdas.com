import type { bundleMDX } from "mdx-bundler";
import { getMDXComponent } from "mdx-bundler/client";
import { useMemo } from "react";
import { HiOutlineCalendar, HiOutlineNewspaper } from "react-icons/hi";

import {
	SectionWrapper,
	IssueContentWrapper,
	IssueSubject,
	IssueInfoWrapper,
	IconContainer,
} from "./styles";

import { MDXComponents } from "@/components/mdx";
import { ButtondownEmailsType } from "@/domains/Buttondown";
import { MDXTitle } from "@/styles/components";

export type IssueViewProps = {
	issue: ButtondownEmailsType["results"][number] & {
		bodyParsed: Awaited<ReturnType<typeof bundleMDX>>;
	};
};
export const NewsletterIssueDetail = ({ issue }: IssueViewProps) => {
	const {
		bodyParsed: { code: bodyContent },
	} = issue;
	const Component = useMemo(() => getMDXComponent(bodyContent), [bodyContent]);

	return (
		<SectionWrapper>
			<IssueContentWrapper>
				<IssueSubject>{issue.subject}</IssueSubject>
				<IssueInfoWrapper>
					<IconContainer>
						<HiOutlineNewspaper /> #{issue.secondary_id}
					</IconContainer>
					<IconContainer>
						<HiOutlineCalendar />{" "}
						{new Date(issue.publish_date).toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</IconContainer>
				</IssueInfoWrapper>
				<Component
					components={{
						MDXTitle,
						...MDXComponents,
					}}
				/>
			</IssueContentWrapper>
		</SectionWrapper>
	);
};
