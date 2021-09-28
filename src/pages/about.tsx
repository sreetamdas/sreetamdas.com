import { getMDXComponent } from "mdx-bundler/client";
import { GetStaticProps } from "next";
import React, { Fragment, useContext, useMemo } from "react";

import { ExternalLinksOverlay } from "components/Navbar";
import { ViewsCounter } from "components/ViewsCounter";
import { Newsletter } from "components/blog/Newsletter";
import { FoobarContext } from "components/foobar";
import { MDXComponents } from "components/mdx";
import { DocumentHead } from "components/shared/seo";
import { Center } from "styles/layouts";
import { Title, LinkTo, RemoveBulletsFromList } from "styles/typography";
import { TBlogPostPageProps } from "typings/blog";
import { getMDXFileData } from "utils/blog";
import { getButtondownSubscriberCount } from "utils/misc";

type TProps = TBlogPostPageProps & { subscriberCount: number };

const About = ({ code, frontmatter: _, subscriberCount }: TProps) => {
	const Component = useMemo(() => getMDXComponent(code), [code]);

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
				<Component
					// @ts-expect-error MDX
					components={{
						ExternalLinksOverlay,
						...MDXComponents,
					}}
				/>
			</RemoveBulletsFromList>

			<ViewsCounter />

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
	const result = await getMDXFileData("about", { cwd: "content" });

	return {
		props: { ...result, subscriberCount },
	};
};
