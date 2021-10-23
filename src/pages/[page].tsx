import { getMDXComponent } from "mdx-bundler/client";
import { GetStaticPaths, GetStaticProps } from "next";
import React, { Fragment, useMemo } from "react";
import { BsTerminalFill } from "react-icons/bs";
import { FaFont, FaPodcast } from "react-icons/fa";
import { SiOculus } from "react-icons/si";

import { ChromaHighlight } from "components/FancyPants";
import { ViewsCounter } from "components/ViewsCounter";
import { Newsletter } from "components/blog/Newsletter";
import { HighlightWithUseEffect, HighlightWithUseInterval } from "components/blog/rgb-text";
import { MDXComponents } from "components/mdx";
import { DocumentHead } from "components/shared/seo";
import { Highlight, CustomBlockquote } from "styles/blog";
import { MDXLink } from "styles/components";
import { Center } from "styles/layouts";
import { Sparkles } from "styles/special";
import { Title, Heavy, MDXTitle, StyledAccentTextLink, TextGradient } from "styles/typography";
import { TBlogPostPageProps } from "typings/blog";
import { getMDXFileData, getRootPagesSlugs } from "utils/blog";
import { getButtondownSubscriberCount } from "utils/misc";

type TProps = TBlogPostPageProps & {
	subscriberCount: number;
};
const Page = ({ code, frontmatter, subscriberCount }: TProps) => {
	const Component = useMemo(() => getMDXComponent(code), [code]);

	return (
		<Fragment>
			<DocumentHead
				title={frontmatter.title}
				imageURL={frontmatter?.image}
				description={frontmatter.summary}
			/>

			<Center>
				<Title size={5}>/{frontmatter.title.toLowerCase()}</Title>
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
					TextGradient,
					Heavy,
					StyledAccentTextLink,

					BsTerminalFill,
					FaFont,
					FaPodcast,
					SiOculus,
					...MDXComponents,
				}}
			/>

			<ViewsCounter />
			<Newsletter {...{ subscriberCount }} />
		</Fragment>
	);
};

export const getStaticPaths: GetStaticPaths = async () => {
	const postsData: Array<{ page: string }> = await getRootPagesSlugs();

	const paths = postsData.map((post) => ({
		params: { page: post.page },
	}));

	return { paths, fallback: false };
};

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
