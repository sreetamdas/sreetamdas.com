import { Fragment } from "react";
import MDXTooling from "content/tooling.mdx";
import { Layout, Center, PaddingListItems } from "components/styled/Layouts";
import Head from "next/head";
import { Title } from "components/styled/blog";

const Uses = () => {
	return (
		<Fragment>
			<Head>
				<title>Tooling &mdash; Sreetam Das</title>
			</Head>
			<Layout>
				<Center>
					<Title>/tooling</Title>
				</Center>
				<PaddingListItems>
					<MDXTooling />
				</PaddingListItems>
			</Layout>
		</Fragment>
	);
};

export default Uses;
