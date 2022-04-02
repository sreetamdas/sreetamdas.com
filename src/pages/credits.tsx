import { getMDXComponent } from "mdx-bundler/client";
import { useMemo } from "react";

import {
	getRepoContributors,
	RepoContributors,
	RepoContributorsProps,
} from "@/components/GitHub/RepoContributors";
import { ExternalLinksOverlay } from "@/components/Navbar";
import { NewsletterSignup } from "@/components/Newsletter/Signup";
import { ViewsCounter } from "@/components/ViewsCounter";
import { MDXComponents } from "@/components/mdx";
import { DocumentHead } from "@/components/shared/seo";
import { getButtondownSubscriberCount } from "@/domains/Buttondown";
import { Center } from "@/styles/layouts";
import { Title } from "@/styles/typography";
import { TBlogPostPageProps } from "@/typings/blog";
import { getMDXFileData } from "@/utils/blog";

type TProps = TBlogPostPageProps & {
	subscriberCount: number;
	repoContributors: RepoContributorsProps["contributors"];
};

const About = ({ code, frontmatter: _, subscriberCount, repoContributors }: TProps) => {
	const Component = useMemo(() => getMDXComponent(code), [code]);

	return (
		<>
			<DocumentHead title="Credits" />

			<Center>
				<Title $size={5}>/credits</Title>
			</Center>

			<Component
				// @ts-expect-error MDX
				components={{
					ExternalLinksOverlay,
					...MDXComponents,
				}}
			/>
			<RepoContributors contributors={repoContributors} />

			<ViewsCounter />

			<NewsletterSignup {...{ subscriberCount }} />
		</>
	);
};

/**
 * maybe take inspiration from how @cassidoo has her website? have multiple
 * "sections" available; so a short one which focuses on just tech, and a longer
 * one that goes into more depth, perhaps even into my origins?
 */

export default About;

export async function getStaticProps() {
	const result = await getMDXFileData("credits", { cwd: "content" });
	const subscriberCount = await getButtondownSubscriberCount();
	const repoContributors = await getRepoContributors();

	return {
		props: { ...result, subscriberCount, repoContributors },
	};
}
