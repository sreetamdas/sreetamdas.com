import Head from "next/head";
import React, { Fragment, useContext } from "react";

import { FoobarContext } from "components/foobar";
import MDXAbout from "content/about.mdx";
import { Title, Text, LinkTo } from "styles/blog";
import { Layout, Center, RemoveBulletsFromOL } from "styles/layouts";

const About = () => {
	const { updateFoobarDataPartially, unlocked } = useContext(FoobarContext);

	const handleXDiscovery = () => {
		if (!unlocked) updateFoobarDataPartially({ unlocked: true });
	};

	return (
		<Fragment>
			<Head>
				<title>About &mdash; Sreetam Das</title>
			</Head>
			<Layout>
				<Center>
					<Title>/about</Title>
				</Center>
				<RemoveBulletsFromOL>
					<MDXAbout />
				</RemoveBulletsFromOL>
				<Center>
					<Text paddingTop={50}>
						<LinkTo
							href="/foobar"
							data-testid="Ⅹ"
							onClick={handleXDiscovery}
							style={{
								color: "var(--color-background)",
								alignSelf: "center",
							}}
						>
							Ⅹ
						</LinkTo>
					</Text>
				</Center>
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
