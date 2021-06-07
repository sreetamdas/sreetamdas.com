import { GetStaticProps } from "next";
import React, { Fragment, useContext } from "react";

import { Newsletter, TNewsletterProps } from "components/blog/Newsletter";
import { FoobarContext } from "components/foobar";
import { DocumentHead } from "components/shared/seo";
import MDXAbout from "content/about.mdx";
import { Center } from "styles/layouts";
import { Title, RemoveBulletsFromList, LinkTo } from "styles/typography";
import { getButtondownSubscriberCount } from "utils/misc";

const About = ({ subscriberCount }: TNewsletterProps) => {
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
			<Newsletter {...{ subscriberCount }} />

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

export const getStaticProps: GetStaticProps = async () => {
	const subscriberCount = await getButtondownSubscriberCount();

	return {
		props: { subscriberCount },
	};
};
