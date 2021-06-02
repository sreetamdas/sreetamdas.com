import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import dynamic from "next/dynamic";
import React, { Fragment } from "react";

import { DocumentHead } from "components/shared/seo";
import { Center } from "styles/layouts";
import {
	Title,
	PaddingListItems,
	RemoveBulletsFromList,
} from "styles/typography";
import { getAboutMDXPagesData } from "utils/blog";

const Page = ({ post }: InferGetStaticPropsType<typeof getStaticProps>) => {
	const { page, content } = post;
	const MDXPage = dynamic(() => import(`content/${page}.mdx`), {
		loading: () => <div dangerouslySetInnerHTML={{ __html: content }} />,
	});

	return (
		<Fragment>
			<DocumentHead title={page.charAt(0).toUpperCase() + page.slice(1)} />

			<Center>
				<Title size={5}>/{page}</Title>
			</Center>
			<PaddingListItems>
				<RemoveBulletsFromList>
					<MDXPage />
				</RemoveBulletsFromList>
			</PaddingListItems>
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

	return { props: { post } };
};

export default Page;
