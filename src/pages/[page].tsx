import { GetStaticPaths, GetStaticProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import React, { Fragment } from "react";

import { META_TAGS } from "pages/_document";
import { Center } from "styles/layouts";
import {
	Title,
	PaddingListItems,
	RemoveBulletsFromOL,
} from "styles/typography";
import { getAboutMDXPagesData } from "utils/blog";

const Page = ({ post }: { post: { page: string; content: string } }) => {
	const { page, content } = post;
	const MDXPage = dynamic(() => import(`content/${page}.mdx`), {
		loading: () => <div dangerouslySetInnerHTML={{ __html: content }} />,
	});

	return (
		<Fragment>
			<Head>
				<title>
					{page.charAt(0).toUpperCase() + page.slice(1)} &mdash; Sreetam Das
				</title>
				{META_TAGS}
			</Head>

			<Center>
				<Title size={5}>/{page}</Title>
			</Center>
			<PaddingListItems>
				<RemoveBulletsFromOL>
					<MDXPage />
				</RemoveBulletsFromOL>
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
