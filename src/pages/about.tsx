import Head from "next/head";
import React, { Fragment, useContext } from "react";

import { FoobarContext } from "components/foobar";
import MDXAbout from "content/about.mdx";
import { META_TAGS } from "pages/_document";
import { Center } from "styles/layouts";
import { Title, RemoveBulletsFromOL, LinkTo } from "styles/typography";

const About = () => {
	const { updateFoobarDataPartially, unlocked } = useContext(FoobarContext);

	const handleXDiscovery = () => {
		if (!unlocked) updateFoobarDataPartially({ unlocked: true });
	};

	return (
		<Fragment>
			<Head>
				<title>About &mdash; Sreetam Das</title>
				{META_TAGS}
			</Head>

			<Center>
				<Title size={5}>/about</Title>
			</Center>
			<RemoveBulletsFromOL>
				<MDXAbout />
			</RemoveBulletsFromOL>
			<Center>
				<LinkTo
					href="/foobar"
					data-testid="Ⅹ"
					onClick={handleXDiscovery}
					style={{
						color: "var(--color-background)",
						alignSelf: "center",
						border: "none",
					}}
				>
					Ⅹ
				</LinkTo>
			</Center>
		</Fragment>
	);
};

/**
 * maybe take inspiration from how cassidoo has her website? have multiple
 * "sections" available; so a short one which focuses on just tech, and a longer
 * one that goes into more depth, perhaps even into my origins?
 */

export default About;
