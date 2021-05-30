// import Playground from "@agney/playground";
import { useMemo } from "react";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import styled from "styled-components";

import { KARMA_PRISM_THEME } from "pages/karma";
import { FullWidth } from "styles/layouts";
import { TextGradient } from "styles/typography";

/* Why is there a tabs import? https://github.com/agneym/playground#why-is-there-a-reacttabs-import*/
// import "@reach/tabs/styles.css";

// const snippet = {
// 	markup: "<div id=app />",
// 	css: "",
// 	javascript: `import { h, Component, render } from 'preact';
// import htm from 'htm';

// const html = htm.bind(h);

// const app = html\`<div>Hello World from Playground!</div>\`

// render(app, document.getElementById('app'));`,
// };

const formatCodeString = (code: string) => {
	return code.trim().replace(/\t/g, "  ");
};

const LiveCode = () => {
	const code = formatCodeString(JSX_STRING);
	const scope = { TextGradient };

	return useMemo(
		() => (
			<FullWidth>
				<Wrapper>
					<LiveProvider {...{ code, scope }}>
						<LiveEditor
							style={{
								fontFamily: "var(--font-family-code)",
								backgroundColor: "#0a0e14",
								borderRadius: "var(--border-radius)",
							}}
							theme={KARMA_PRISM_THEME}
						/>
						<StyledPreview />
						<StyledError />
					</LiveProvider>
				</Wrapper>
				{/* <Playground
				id="example"
				initialSnippet={snippet}
				defaultEditorTab="javascript"
				transformJs
				mode={theme.theme!}
			/> */}
			</FullWidth>
		),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);
};
export { LiveCode };

const JSX_STRING = `
<h2>
	<TextGradient>Hello World!</TextGradient>
</h2>`;

const Wrapper = styled.div`
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	border-radius: var(--border-radius);
	padding: 0 2rem;
`;

const StyledError = styled(LiveError)`
	padding: 1rem;
	background: var(--color-background);
	color: var(--color-error);
	font-size: 75%;
	grid-column: -1 / 1;
`;

const StyledPreview = styled(LivePreview)`
	position: relative;
	padding: 1rem;
	background: var(--color-background);
	color: var(--color-primary);
	height: auto;
	overflow: hidden;
`;
