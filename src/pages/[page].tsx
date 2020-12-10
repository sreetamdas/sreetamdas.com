import { GetStaticPaths, GetStaticProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import React, { Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { META_TAGS } from "pages/_document";
import { Center } from "styles/layouts";
import {
	Title,
	PaddingListItems,
	RemoveBulletsFromOL,
} from "styles/typography";
import { getAboutMDXPagesData } from "utils/blog";

const Page = ({ page, mdxString }: { page: string; mdxString: string }) => {
	const MDXPage = dynamic(() => import(`content/${page}.mdx`), {
		loading: () => <div dangerouslySetInnerHTML={{ __html: mdxString }} />,
	});

	return (
		<Fragment>
			<Head>
				<title>
					{page.charAt(0).toUpperCase() + page.slice(1)} &mdash;
					Sreetam Das
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
	const postsData: Array<{ page: string }> = getAboutMDXPagesData();
	const paths = postsData.map((post) => ({
		params: { page: post.page },
	}));

	return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	if (!params) return { props: {} };

	const postsData = getAboutMDXPagesData();
	const post = postsData.find((postData) => postData.page === params.page);
	const { default: MDXContent } = await import(`content/${post?.page}.mdx`);
	const mdxString = renderToStaticMarkup(<MDXContent />);

	return { props: { page: post?.page, mdxString } };
};

export default Page;
