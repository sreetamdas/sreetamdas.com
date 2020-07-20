import MDXAbout from "content/about.mdx";
import { Fragment } from "react";
import Head from "next/head";
import { Layout, Center, PaddingListItems } from "components/styled/Layouts";
import { Title, Text, LinkTo } from "components/styled/blog";
import { ExternalLinksOverlay } from "components/Navbar";

const About = () => {
	return (
		<Fragment>
			<Head>
				<title>About &mdash; Sreetam Das</title>
			</Head>
			<Layout>
				<Center>
					<Title>/about</Title>
				</Center>
				<MDXAbout />
				<Text>You can check me out from the following links:</Text>
				<ExternalLinksOverlay />
				<Text>
					and if you&apos;re interested, you can take a look at my{" "}
					<a
						href="https://drive.google.com/file/u/2/d/121tFdPrPPImCeWJg0NMLVwBfpGc5RCnV/view"
						target="_blank"
						rel="noopener noreferrer"
					>
						resume
					</a>
				</Text>
				<Text>
					Here&apos;s a list of pages that curate my likes to give you
					more insight into me:
				</Text>
				<PaddingListItems>
					<Text>
						<LinkTo href="/podcasts">Podcasts</LinkTo> that I listen
						to
						{/* <br />
						<LinkTo href="/tooling">Tooling</LinkTo> that I am
						always excited to use */}
					</Text>
					<Center>
						<Text paddedTop>
							<LinkTo
								href="/foobar"
								data-testid="Ⅹ"
								style={{
									color: "var(--color-background)",
									alignSelf: "center",
								}}
							>
								Ⅹ
							</LinkTo>
						</Text>
					</Center>
				</PaddingListItems>
			</Layout>
		</Fragment>
	);
};

/**
 * maybe take inspiration from how cassidoo has her website? have multiple
 * "sections" available; so a short one which focuses on just tech, and a longer
 * one that goes into more depth, perhaps even into my origins?
 */

export default About;
