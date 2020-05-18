import Head from "next/head";
import { Fragment } from "react";
import { Text, Title, ExternalLink } from "components/Layouts";

const Index = () => {
	return (
		<Fragment>
			<Head>
				<title>Hey I&apos;m Sreetam 👋</title>
			</Head>
			<Title>Hey, I&apos;m Sreetam Das!</Title>
			<Text>
				I&apos;m a developer from India in love with all things React.
				I&apos;ve also been fortunate enough to have worked with
				different languages like Python, JavaScript, TypeScript and C++,
				as well as things like Node, Django and Redux!
			</Text>
			<Text>
				I&apos;m currently leading the frontend team at{" "}
				<ExternalLink href="https://www.microland.com/">
					Microland
				</ExternalLink>{" "}
				working with React + Redux + TypeScript, the sweetest
				combination in my opinion.
			</Text>
			<Text paddedTop>
				I also ❤️ a lot of other things, so in no particular order:
			</Text>
			<Text>
				CSGO, Reddit, Mechanical Keyboards, Open Source, GitHub,
				Factorio, Tactile Switches
			</Text>
		</Fragment>
	);
};

export default Index;
