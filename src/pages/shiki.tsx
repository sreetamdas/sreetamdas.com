import { ViewsCounter } from "@/components/ViewsCounter";
import { DocumentHead } from "@/components/shared/seo";
import { ShikiPlayground } from "@/components/shiki";
import { Center, Space } from "@/styles/layouts";
import { LinkTo, Paragraph, Title } from "@/styles/typography";

const ShikiPage = () => (
	<>
		<DocumentHead title="Shiki" />
		<Space />
		<Center>
			<Title $size={5}>/shiki</Title>
		</Center>
		<Paragraph>
			Hello there!
			<br />
			<br />
			The following component runs{" "}
			<LinkTo href="https://github.com/shikijs/shiki" target="_blank">
				Shiki
			</LinkTo>{" "}
			in the browser for code highlighting.
			<br />
			<br />
			Shiki uses TextMate grammars to tokenize strings, and colors the tokens via VS Code
			themes—generating HTML that looks exactly like your code in VS Code!
		</Paragraph>

		<ShikiPlayground />

		<ViewsCounter />
	</>
);

export default ShikiPage;
