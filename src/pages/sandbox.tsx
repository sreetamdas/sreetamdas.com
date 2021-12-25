import { Sandbox } from "@/components/Sandbox";
import { ViewsCounter } from "@/components/ViewsCounter";
import { DocumentHead } from "@/components/shared/seo";
import { Center, Space } from "@/styles/layouts";
import "@codesandbox/sandpack-react/dist/index.css";
import { ExternalLink, Paragraph, Title } from "@/styles/typography";

const JSX_STRING = `
export default function App() {
  return <h2>Hello World!</h2>
}
`;

function formatCodeString(code: string) {
	return code.trim().replace(/\t/g, "  ");
}

const Index = () => {
	return (
		<>
			<DocumentHead
				title="Sandbox"
				description="A sandbox to play in, built with @codesandbox/sandpack"
			/>
			<Center>
				<Title size={5}>/sandbox</Title>
				<Paragraph>
					A sandbox for you to play with, built with{" "}
					<ExternalLink href="https://sandpack.codesandbox.io">Sandpack</ExternalLink>.
				</Paragraph>
			</Center>

			<Sandbox
				template="react"
				files={{
					"/App.js": formatCodeString(JSX_STRING),
				}}
			/>
			<Space size={50} />
			<ViewsCounter />
		</>
	);
};

export default Index;
