import { Fragment } from "react";
import MDXUses from "content/Uses.mdx";
import { Layout, RemoveBullterFromOL } from "components/Layouts";
import Head from "next/head";

const Uses = () => {
	return (
		<Fragment>
			<Head>
				<title>Uses &mdash; Sreetam Das</title>
			</Head>
			<Layout>
				<RemoveBullterFromOL>
					<MDXUses />
				</RemoveBullterFromOL>
			</Layout>
		</Fragment>
	);
};

export default Uses;
