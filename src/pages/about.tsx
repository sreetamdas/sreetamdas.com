import React, { Fragment, useContext } from "react";

import { Newsletter } from "components/blog/Newsletter";
import { FoobarContext } from "components/foobar";
import { DocumentHead } from "components/shared/seo";
import MDXAbout from "content/about.mdx";
import { Center } from "styles/layouts";
import { Title, RemoveBulletsFromList, LinkTo } from "styles/typography";

const About = () => {
	const { updateFoobarDataPartially, unlocked } = useContext(FoobarContext);

	const handleXDiscovery = () => {
		if (!unlocked) updateFoobarDataPartially({ unlocked: true });
	};

	return (
		<Fragment>
			<DocumentHead title="About" />

			<Center>
				<Title size={5}>/about</Title>
			</Center>

			<RemoveBulletsFromList>
				<MDXAbout />
			</RemoveBulletsFromList>
			<Newsletter />

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
