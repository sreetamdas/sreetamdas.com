import { Fragment } from "react";
import {
	Layout,
	Center,
	MDXText,
	TextGradient,
} from "components/styled/Layouts";
import Tooling from "content/tooling.mdx";
import { Text, Title, StyledLink } from "components/styled/blog";
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
					I&apos;m currently the module lead for the frontend team at{" "}
					<StyledLink href="https://www.microland.com">
						Microland
					</StyledLink>{" "}
					working with{" "}
					<TextGradient>React + Redux + TypeScript</TextGradient>, the{" "}
					<em>sweetest</em> combination in my opinion.
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
