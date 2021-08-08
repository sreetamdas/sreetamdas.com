import React, { Fragment } from "react";
import styled from "styled-components";

import { DocumentHead } from "components/shared/seo";
import { StyledDetails, StyledSummary, StyledDetailAnswer } from "styles/components";
import { Center, Space } from "styles/layouts";
import { ExternalLink, Paragraph, Title } from "styles/typography";

const Index = () => {
	return (
		<Fragment>
			<DocumentHead title="FAQ" description="Questions that you may have, answered" />

			<Center>
				<Title size={5}>/faq</Title>
			</Center>
			<Paragraph>
				Frequently Asked Questions. Have a question that isn&apos;t answered here? Feel free to{" "}
				<ExternalLink href="https://twitter.com/messages/compose?recipient_id=520276345">
					DM me on Twitter
				</ExternalLink>{" "}
				:)
			</Paragraph>

			<Space size={20} />

			<FAQGrid>
				<StyledDetails>
					<StyledSummary>What are those &quot;plus sign keys&quot; on your desk?</StyledSummary>
					<StyledDetailAnswer>
						I&apos;m so glad you asked! Those are different{" "}
						<ExternalLink href="https://keyboard.university/100-courses/switches-101">
							switches
						</ExternalLink>{" "}
						that I&apos;d purchased to test out before buying my{" "}
						<ExternalLink href="https://srtm.fyi/keeb">custom mechanical keyboard</ExternalLink>. If
						you&apos;re interested, you can check them out (and order some for yourself!) on{" "}
						<ExternalLink href="https://rectangles.store">Rectangles.store</ExternalLink> :)
					</StyledDetailAnswer>
				</StyledDetails>
				<StyledDetails>
					<StyledSummary>What keyboard is that on your desk?</StyledSummary>
					<StyledDetailAnswer>
						It&apos;s a custom mechanical keyboard you can find more details in{" "}
						<ExternalLink href="https://srtm.fyi/keeb">the tweet about it</ExternalLink>.
					</StyledDetailAnswer>
				</StyledDetails>
				<StyledDetails>
					<StyledSummary>Cool website! How&apos;d you build it?</StyledSummary>
					<StyledDetailAnswer>
						Thanks! You can check out the{" "}
						<ExternalLink href="https://github.com/sreetamdas/sreetamdas.com">
							source code on GitHub
						</ExternalLink>
						.
					</StyledDetailAnswer>
				</StyledDetails>
			</FAQGrid>
		</Fragment>
	);
};

export default Index;

const FAQGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	gap: 2rem;
`;
