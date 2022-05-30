import { getMDXComponent } from "mdx-bundler/client";
import { GetStaticProps } from "next";
import { useMemo } from "react";

import { ChromaHighlight } from "@/components/FancyPants";
import { NewsletterSignup } from "@/components/Newsletter/Signup";
import { ViewsCounter } from "@/components/ViewsCounter";
import { HighlightWithUseEffect, HighlightWithUseInterval } from "@/components/blog/rgb-text";
import { MDXComponents } from "@/components/mdx";
import { DocumentHead } from "@/components/shared/seo";
import { getButtondownSubscriberCount } from "@/domains/Buttondown";
import { Highlight, CustomBlockquote } from "@/styles/blog";
import { MDXLink } from "@/styles/components";
import { Center } from "@/styles/layouts";
import { Sparkles } from "@/styles/special";
import { Title, Heavy, MDXTitle, StyledAccentTextLink, PrimaryGradient } from "@/styles/typography";
import { MDXBundledResultProps } from "@/typings/blog";
import { getMDXFileData, getRootPagesSlugs } from "@/utils/blog";

type TProps = MDXBundledResultProps & {
	subscriberCount: number;
};
const Page = ({ code, frontmatter, subscriberCount }: TProps) => {
	const Component = useMemo(() => getMDXComponent(code), [code]);

	return (
		<>
			<DocumentHead
				title={frontmatter.title}
				imageURL={frontmatter?.image}
				description={frontmatter.summary}
			/>

			<Center>
				<Title $size={5}>/{frontmatter.title.toLowerCase()}</Title>
			</Center>
			<Component
				// @ts-expect-error ugh, MDX
				components={{
					MDXLink,
					MDXTitle,
					Sparkles,
					ChromaHighlight,
					HighlightWithUseEffect,
					HighlightWithUseInterval,
					Highlight,
					CustomBlockquote,
					TextGradient: PrimaryGradient,
					Heavy,
					StyledAccentTextLink,
					...MDXComponents,
				}}
			/>

			<ViewsCounter />
			<NewsletterSignup {...{ subscriberCount }} />
		</>
	);
};

export async function getStaticPaths() {
	const postsData: Array<{ page: string }> = await getRootPagesSlugs();

	const paths = postsData.map((post) => ({
		params: { page: post.page },
	}));

	return { paths, fallback: false };
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const subscriberCount = await getButtondownSubscriberCount();
	if (typeof params?.page === "undefined" || Array.isArray(params?.page)) {
		return {
			props: {
				subscriberCount,
			},
		};
	}
	const result = await getMDXFileData(params?.page);

	return { props: { ...result, subscriberCount } };
};

export default Page;
