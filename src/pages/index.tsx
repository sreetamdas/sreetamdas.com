import Head from "next/head";
import React, { Fragment } from "react";

import Tooling from "content/tooling.mdx";
import { META_TAGS } from "pages/_document";
import { Center } from "styles/layouts";
import {
	TextGradient,
	Heavy,
	MDXText,
	Title,
	Paragraph,
	LinkTo,
	StyledLink,
} from "styles/typography";

const Index = () => {
	return (
		<Fragment>
			<Head>
				<title>Home &mdash; Sreetam Das</title>
				{META_TAGS}
			</Head>

			<Center>
				<Title size={2.5}>
					Hey, I&apos;m Sreetam Das!{" "}
					<span role="img" aria-label="wave emoji">
						👋
					</span>
				</Title>
			</Center>
			<Paragraph>
				I&apos;m a developer from India in love with all things React.
				I&apos;ve also worked with different languages like Python,
				JavaScript, TypeScript and C++, as well as Node, Django and
				Redux.
			</Paragraph>
			<Paragraph>
				I&apos;m currently a Frontend Engineer at{" "}
				<StyledLink href="https://remote.com">Remote</StyledLink> who
				loves working with{" "}
				<TextGradient>
					<Heavy>React + Redux + TypeScript</Heavy>
				</TextGradient>
				, the <em>sweetest</em> combination in my opinion.
			</Paragraph>
			<MDXText>
				<Tooling />
			</MDXText>
			<Paragraph>
				I also{" "}
				<span role="img" aria-label="heart">
					❤️
				</span>{" "}
				a lot of other things, in no particular order:
				<br />
				<br />
				CSGO, Reddit, Mechanical Keyboards, Open Source, GitHub,
				Factorio, Tactile Switches, Batman and the Internet!
				<br />
				{process.env.NODE_ENV === "development" && (
					<LinkTo href="/fancy-pants">McFancyPants</LinkTo>
				)}
			</Paragraph>
		</Fragment>
	);
};

export default Index;
