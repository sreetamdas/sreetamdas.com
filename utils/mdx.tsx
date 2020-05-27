// @ts-nocheck
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React from "react";
import Highlight, { defaultProps } from "prism-react-renderer";
import nightOwl from "prism-react-renderer/themes/nightOwl";
import { mdx } from "@mdx-js/react";

const MDXCodeBlock = (props) => {
	const {
		children: {
			props: { children, className },
		},
	} = props;
	const language = className.replace(/language-/, "");

	return (
		<Highlight
			{...defaultProps}
			code={children.trim()}
			language={language}
			theme={nightOwl}
		>
			{({ className, style, tokens, getLineProps, getTokenProps }) => (
				<pre
					className={className}
					style={{ ...style, padding: "20px" }}
				>
					{tokens.map((line, i) => (
						<div key={i} {...getLineProps({ line, key: i })}>
							{line.map((token, key) => (
								<span
									key={key}
									{...getTokenProps({ token, key })}
								/>
							))}
						</div>
					))}
				</pre>
			)}
		</Highlight>
	);
};

export { MDXCodeBlock };
