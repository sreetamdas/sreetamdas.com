import Head from "next/head";
import { Fragment } from "react";
import {
	Text,
	Title,
	ExternalLink,
	Layout,
	Center,
	MDXText,
} from "components/Layouts";
import Tooling from "mdx/Tooling.mdx";

const Index = () => {
	return (
		<Fragment>
			<Head>
				<title>Hey I&apos;m Sreetam 👋</title>
			</Head>
			<Layout>
				<Center>
					<Title>Hey, I&apos;m Sreetam Das!</Title>
				</Center>
				<Text>
					I&apos;m a developer from India in love with all things
					React. I&apos;ve also worked with different languages like
					Python, JavaScript, TypeScript and C++, as well as things
					like Node, Django and Redux.
				</Text>
				<Text>
					I&apos;m currently leading the frontend team at{" "}
					<ExternalLink href="https://www.microland.com/">
						Microland
					</ExternalLink>{" "}
					working with React + Redux + TypeScript, the sweetest
					combination in my opinion.
				</Text>
				<MDXText>
					<Tooling />
				</MDXText>
				<Text paddedTop>
					I also ❤️ a lot of other things, in no particular order:
				</Text>
				<Text>
					CSGO, Reddit, Mechanical Keyboards, Open Source, GitHub,
					Factorio, Tactile Switches
				</Text>
			</Layout>
		</Fragment>
	);
};

export default Index;
