import { getMDXComponent } from "mdx-bundler/client";
import { InferGetStaticPropsType } from "next";
import React, { Fragment, useMemo } from "react";

import { ViewsCounter } from "@/components/ViewsCounter";
import { Newsletter } from "@/components/blog/Newsletter";
import { MDXComponents } from "@/components/mdx";
import { DocumentHead } from "@/components/shared/seo";
import { Center, Space } from "@/styles/layouts";
import { TextGradient, Heavy, MDXText, Title, Paragraph, StyledLink } from "@/styles/typography";
import { getMDXFileData } from "@/utils/blog";
import { getButtondownSubscriberCount } from "@/utils/misc";

const Index = ({ code, subscriberCount }: InferGetStaticPropsType<typeof getStaticProps>) => {
	const Component = useMemo(() => getMDXComponent(code), [code]);

	return (
		<Fragment>
			<DocumentHead title="Home" />

			<Space size={25} />
			<Center>
				<Title size={2.5}>
					Hey, I&apos;m Sreetam Das!{" "}
					<span role="img" aria-label="wave">
						👋
					</span>
				</Title>
			</Center>
			<Space size={25} />
			<Paragraph>
				I&apos;m a developer from India in love with all things React. I&apos;ve also worked with
				different languages like Python, JavaScript, Elixir, TypeScript and C++, as well as Node,
				Django and Redux.
			</Paragraph>
			<Paragraph>
				I&apos;m currently a front-end engineer at{" "}
				<StyledLink href="https://remote.com">Remote</StyledLink> who loves working with{" "}
				<TextGradient>
					<Heavy>React + TypeScript</Heavy>
				</TextGradient>
				.
			</Paragraph>
			<MDXText>
				<Component
					// @ts-expect-error MDX
					components={{
						...MDXComponents,
					}}
				/>
			</MDXText>
			<Paragraph>
				I also{" "}
				<span role="img" aria-label="heart">
					❤️
				</span>{" "}
				a lot of other things, in no particular order:
				<br />
				<br />
				CSGO, Reddit, Mechanical Keyboards, Open Source, GitHub, Factorio, Tactile Switches, Batman
				and the Internet!
			</Paragraph>

			<ViewsCounter hidden />
			<Newsletter {...{ subscriberCount }} />
		</Fragment>
	);
};

export default Index;

export async function getStaticProps() {
	const subscriberCount = await getButtondownSubscriberCount();
	const result = await getMDXFileData("tooling", { cwd: "content" });

	return {
		props: { ...result, subscriberCount },
	};
}
