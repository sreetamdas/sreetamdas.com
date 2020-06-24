import MDXAbout from "content/about.mdx";
import { Fragment } from "react";
import Head from "next/head";
import { Layout, Center, PaddingListItems } from "components/styled/Layouts";
import { Title, Text, LinkTo } from "components/styled/blog";

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
				<Text>
					Here&apos;s a list of pages that curate my likes to give you
					more insight into me:
				</Text>
				<PaddingListItems>
					<Text>
						<LinkTo href="/podcasts">Podcasts</LinkTo> that I listen
						to
						{/* <br />
						<LinkTo href="/tooling">Tooling</LinkTo> that I am
						always excited to use */}
					</Text>
				</PaddingListItems>
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
