import { Fragment } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { Title } from "styles/blog";
import {
	Layout,
	Center,
	PaddingListItems,
	RemoveBulletsFromOL,
} from "styles/layouts";
import { getAboutMDXPagesData } from "utils/blog";

const AboutPage = () => {
	const router = useRouter();
	const {
		query: { page },
	} = (router as unknown) as { query: { page: string } };

	const MDXPage = dynamic(() => import(`content/${page}.mdx`));

	return (
		<Fragment>
			<Head>
				<title>
					{page.charAt(0).toUpperCase() + page.slice(1)} &mdash;
					Sreetam Das
				</title>
			</Head>
			<Layout>
				<Center>
					<Title>/{page}</Title>
				</Center>
				<PaddingListItems>
					<RemoveBulletsFromOL>
						<MDXPage />
					</RemoveBulletsFromOL>
				</PaddingListItems>
			</Layout>
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

	return { props: { post } };
};

export default AboutPage;
