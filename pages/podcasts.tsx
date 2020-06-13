import { Fragment } from "react";
import MDXPodcasts from "content/podcasts.mdx";
import { Layout, Center, PaddingListItems } from "components/Layouts";
import Head from "next/head";
import { Title } from "styled/blog";

const Uses = () => {
	return (
		<Fragment>
			<Head>
				<title>Podcasts &mdash; Sreetam Das</title>
			</Head>
			<Layout>
				<Center>
					<Title>/podcasts</Title>
				</Center>
				<PaddingListItems>
					<MDXPodcasts />
				</PaddingListItems>
			</Layout>
		</Fragment>
	);
};

export default Uses;
