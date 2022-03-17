import { bundleMDX } from "mdx-bundler";
import { getMDXComponent } from "mdx-bundler/client";
import { useMemo } from "react";

import { SectionWrapper, IssueContentWrapper, IssueSubject } from "./styles";

import { MDXComponents } from "@/components/mdx";
import { ButtondownEmailsType } from "@/domains/Buttondown";
import { MDXLink, MDXTitle } from "@/styles/components";
import { PromiseResolvedType } from "@/typings/blog";

export type IssueViewProps = {
	issue: ButtondownEmailsType["results"][number] & {
		bodyParsed: PromiseResolvedType<ReturnType<typeof bundleMDX>>;
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
					// @ts-expect-error ugh, MDX
					components={{
						MDXLink,
						MDXTitle,
						...MDXComponents,
					}}
				/>
				{/* <PreviewBody dangerouslySetInnerHTML={{ __html: micromark(issue.body) }}></PreviewBody> */}
			</IssueContentWrapper>
		</SectionWrapper>
	);
};
