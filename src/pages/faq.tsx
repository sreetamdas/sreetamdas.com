import styled from "styled-components";

import { ViewsCounter } from "@/components/ViewsCounter";
import { DocumentHead } from "@/components/shared/seo";
import { StyledDetails, StyledSummary, StyledDetailAnswer } from "@/styles/components";
import { Center, Space } from "@/styles/layouts";
import { LinkTo, Paragraph, Title } from "@/styles/typography";

const Index = () => (
	<>
		<DocumentHead title="FAQ" description="Questions that you may have, answered!" />

		<Center>
			<Title $size={5}>/faq</Title>
		</Center>
		<Paragraph>
			Frequently Asked Questions. Have a question that isn&apos;t answered here? Feel free to{" "}
			<LinkTo href="https://twitter.com/messages/compose?recipient_id=520276345" target="_blank">
				DM me on Twitter
			</LinkTo>{" "}
			😄
		</Paragraph>

		<Space $size={20} />

		<FAQGrid>
			<StyledDetails>
				<StyledSummary>What are those &quot;plus sign keys&quot; on your desk?</StyledSummary>
				<StyledDetailAnswer>
					I&apos;m so glad you asked! Those are different{" "}
					<LinkTo href="https://keyboard.university/100-courses/switches-101" target="_blank">
						switches
					</LinkTo>{" "}
					that I&apos;d purchased to test out before buying my{" "}
					<LinkTo href="https://srtm.fyi/keeb" target="_blank">
						custom mechanical keyboard
					</LinkTo>
					. If you&apos;re interested, you can check them out (and order some for yourself!) on{" "}
					<LinkTo href="https://rectangles.store" target="_blank">
						Rectangles.store
					</LinkTo>{" "}
					😄
				</StyledDetailAnswer>
			</StyledDetails>
			<StyledDetails>
				<StyledSummary>What keyboard is that on your desk?</StyledSummary>
				<StyledDetailAnswer>
					It&apos;s a custom mechanical keyboard you can find more details in{" "}
					<LinkTo href="https://srtm.fyi/keeb" target="_blank">
						the tweet about it
					</LinkTo>
					.
				</StyledDetailAnswer>
			</StyledDetails>
			<StyledDetails>
				<StyledSummary>Cool website! How&apos;d you build it?</StyledSummary>
				<StyledDetailAnswer>
					Thanks! You can check out the{" "}
					<LinkTo href="https://github.com/sreetamdas/sreetamdas.com" target="_blank">
						source code on GitHub
					</LinkTo>
					.
				</StyledDetailAnswer>
			</StyledDetails>
		</FAQGrid>

		<ViewsCounter />
	</>
);

export default Index;

const FAQGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	column-gap: 2rem;
	row-gap: 4rem;
`;
