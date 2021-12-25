import { Fragment } from "react";

import { Sandbox } from "@/components/Sandbox";
import { ViewsCounter } from "@/components/ViewsCounter";
import { DocumentHead } from "@/components/shared/seo";
import { Center, Space } from "@/styles/layouts";
import "@codesandbox/sandpack-react/dist/index.css";
import { Title } from "@/styles/typography";

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
		<Fragment>
			<DocumentHead title="Sandbox" />
			<Center>
				<Title size={5}>/sandbox</Title>
			</Center>

			<Sandbox
				template="react"
				files={{
					"/App.js": formatCodeString(JSX_STRING),
				}}
			/>

			<Space size={50} />
			<ViewsCounter />
		</Fragment>
	);
};

export default Index;
