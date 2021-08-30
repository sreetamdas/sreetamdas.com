import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { Fragment } from "react";
import { useQuery } from "react-query";

import { Newsletter } from "components/blog/Newsletter";
import { MDXWrapper } from "components/mdx";
import { DocumentHead } from "components/shared/seo";
import { Center } from "styles/layouts";
import { Title, PaddingListItems, RemoveBulletsFromList } from "styles/typography";
import { getAboutMDXPagesData } from "utils/blog";
import { getButtondownSubscriberCount, updateAndGetViewCount } from "utils/misc";

const Page = ({ post, subscriberCount }: InferGetStaticPropsType<typeof getStaticProps>) => {
	const { asPath } = useRouter();
	const { page, content } = post;
	const MDXPage = dynamic(() => import(`content/${page}.mdx`), {
		loading: () => <div dangerouslySetInnerHTML={{ __html: content }} />,
	});

	const { data } = useQuery<{ views: number }>(
		["page-details", "view", asPath],
		async () => await updateAndGetViewCount(asPath),
		{
			staleTime: Infinity,
		}
	);

	return (
		<Fragment>
			<DocumentHead title={page.charAt(0).toUpperCase() + page.slice(1)} />

			<Center>
				<Title size={5}>
					/{page} — {data?.views} views
				</Title>
			</Center>
			<PaddingListItems>
				<RemoveBulletsFromList>
					<MDXWrapper>
						<MDXPage />
					</MDXWrapper>
				</RemoveBulletsFromList>
			</PaddingListItems>
			<Newsletter {...{ subscriberCount }} />
		</Fragment>
	);
};

export const getStaticPaths: GetStaticPaths = async () => {
	const postsData: Array<{ page: string }> = await getAboutMDXPagesData();
	const paths = postsData.map((post) => ({
		params: { page: post.page },
	}));

	return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	if (!params) return { props: {} };

	const postsData = await getAboutMDXPagesData();
	const post = postsData.find((postData) => postData.page === params.page);
	const subscriberCount = await getButtondownSubscriberCount();

	return { props: { post, subscriberCount } };
};

export default Page;
