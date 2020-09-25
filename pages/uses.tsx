import { Fragment } from "react";
import MDXUses from "content/uses.mdx";
import { Layout, RemoveBulletsFromOL, Center } from "styles/layouts";
import Head from "next/head";
import { Title } from "styles/blog";

const Uses = () => {
	return (
		<Fragment>
			<Head>
				<title>Uses &mdash; Sreetam Das</title>
			</Head>
			<Layout>
				<Center>
					<Title>/uses</Title>
				</Center>
				<RemoveBulletsFromOL>
					<MDXUses />
				</RemoveBulletsFromOL>
			</Layout>
		</Fragment>
	);
};

export default Uses;
