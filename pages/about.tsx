import MDXAbout from "content/about.mdx";
import { Fragment } from "react";
import Head from "next/head";
import { Layout, Center } from "components/Layouts";
import { Title } from "styled/blog";

const About = () => {
	return (
		<Fragment>
			<Head>
				<title>About &mdash; Sreetam Das</title>
			</Head>
			<Layout>
				<Center>
					<Title>/about</Title>
				</Center>
				<MDXAbout />
			</Layout>
		</Fragment>
	);
};

/**
 * maybe take inspiration from how cassidoo has her website? have multiple
 * "sections" available; so a short one which focuses on just tech, and a longer
 * one that goes into more depth, perhaps even into my origins?
 */

export default About;
