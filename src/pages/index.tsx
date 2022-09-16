import { getMDXComponent } from "mdx-bundler/client";
import { InferGetStaticPropsType } from "next";
import { useMemo } from "react";

import { NewsletterSignup } from "@/components/Newsletter/Signup";
import { ViewsCounter } from "@/components/ViewsCounter";
import { MDXComponents } from "@/components/mdx";
import { DocumentHead } from "@/components/shared/seo";
import { getButtondownSubscriberCount } from "@/domains/Buttondown";
import { Center, Space } from "@/styles/layouts";
import { PrimaryGradient, Heavy, MDXText, Title, Paragraph, StyledLinkBase } from "@/styles/typography";
import { getMDXFileData } from "@/utils/blog";

const Index = ({ code, subscriberCount }: InferGetStaticPropsType<typeof getStaticProps>) => {
	const Component = useMemo(() => getMDXComponent(code), [code]);

	return (
		<>
			<DocumentHead title="Home" />

			<Space $size={25} />
			<Center>
				<Title $size={2.5}>
					Hey, I&apos;m Sreetam Das!{" "}
					<span role="img" aria-label="wave">
						👋
					</span>
				</Title>
			</Center>
			<Space $size={25} />
			<Paragraph>
				I&apos;m a developer from India in love with all things React. I&apos;ve also worked with
				different languages like Python, JavaScript, Elixir, TypeScript and C++, as well as Node,
				Django and Redux.
			</Paragraph>
			<Paragraph>
				I&apos;m currently a front-end engineer at{" "}
				<StyledLinkBase href="https://remote.com">Remote</StyledLinkBase> who loves working with{" "}
				<PrimaryGradient>
					<Heavy>React + TypeScript</Heavy>
				</PrimaryGradient>
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
			<NewsletterSignup {...{ subscriberCount }} />
		</>
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
