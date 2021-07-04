import React, { Fragment } from "react";

import { DocumentHead } from "components/shared/seo";
import Tooling from "content/tooling.mdx";
import { Center } from "styles/layouts";
import { TextGradient, Heavy, MDXText, Title, Paragraph, StyledLink } from "styles/typography";

const Index = () => {
	return (
		<Fragment>
			<DocumentHead title="Home" />

			<Center>
				<Title size={2.5}>
					Hey, I&apos;m Sreetam Das!{" "}
					<span role="img" aria-label="wave">
						👋
					</span>
				</Title>
			</Center>
			<Paragraph>
				I&apos;m a developer from India in love with all things React. I&apos;ve also worked with
				different languages like Python, JavaScript, Elixir, TypeScript and C++, as well as Node,
				Django and Redux.
			</Paragraph>
			<Paragraph>
				I&apos;m currently a Frontend Engineer at{" "}
				<StyledLink href="https://remote.com">Remote</StyledLink> who loves working with{" "}
				<TextGradient>
					<Heavy>React + TypeScript</Heavy>
				</TextGradient>
				.
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
				CSGO, Reddit, Mechanical Keyboards, Open Source, GitHub, Factorio, Tactile Switches, Batman
				and the Internet!
			</Paragraph>
		</Fragment>
	);
};

export default Index;
