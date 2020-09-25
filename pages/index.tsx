import { Fragment } from "react";
import { Layout, Center, MDXText, TextGradient, Heavy } from "styles/layouts";
import Tooling from "content/tooling.mdx";
import { Text, Title, StyledAccentLink, LinkTo } from "styles/blog";
import Head from "next/head";

const Index = () => {
	return (
		<Fragment>
			<Head>
				<title>Home &mdash; Sreetam Das</title>
			</Head>
			<Layout>
				<Center>
					<Title>Hey, I&apos;m Sreetam Das! 👋</Title>
				</Center>
				<Text>
					I&apos;m a developer from India in love with all things
					React. I&apos;ve also worked with different languages like
					Python, JavaScript, TypeScript and C++, as well as Node,
					Django and Redux.
				</Text>
				<Text>
					I&apos;m currently the Module Lead for the Frontend team at{" "}
					<StyledAccentLink href="https://www.microland.com">
						Microland
					</StyledAccentLink>{" "}
					working with{" "}
					<TextGradient>
						<Heavy>React + Redux + TypeScript</Heavy>
					</TextGradient>
					, the <em>sweetest</em> combination in my opinion.
				</Text>
				<MDXText>
					<Tooling />
				</MDXText>
				<Text paddingTop>
					I also ❤️ a lot of other things, in no particular order:
				</Text>
				<Text>
					CSGO, Reddit, Mechanical Keyboards, Open Source, GitHub,
					Factorio, Tactile Switches, Batman and the Internet!
				</Text>
				{process.env.NODE_ENV === "development" && (
					<LinkTo href="/fancy-pants">McFancyPants</LinkTo>
				)}
			</Layout>
		</Fragment>
	);
};

export default Index;
