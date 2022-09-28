import type { bundleMDX } from "mdx-bundler";
import { getMDXComponent } from "mdx-bundler/client";
import { useMemo } from "react";

import { SectionWrapper, IssueContentWrapper, IssueSubject } from "./styles";

import { MDXComponents } from "@/components/mdx";
import { ButtondownEmailsType } from "@/domains/Buttondown";
import { MDXLink, MDXTitle } from "@/styles/components";

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
				<Component
					components={{
						MDXLink,
						MDXTitle,
						...MDXComponents,
					}}
				/>
			</IssueContentWrapper>
		</SectionWrapper>
	);
};
