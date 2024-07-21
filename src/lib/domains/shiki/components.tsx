import { isObject } from "lodash-es";
import {
	type CSSProperties,
	Children,
	type DetailedHTMLProps,
	type HTMLAttributes,
	type ReactNode,
	isValidElement,
} from "react";

import { cn } from "@/lib/helpers/utils";

type CodeBlockProps = DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement> & {
	children?: ReactNode;
	language?: string;
	highlight?: string;

	className?: string;
	style?: CSSProperties;
};

export const CodeBlock = (props: CodeBlockProps) => {
	const { children: code_element, style } = props;

	if (!isValidElement(code_element)) {
		return null;
	}

	const lang = code_element?.props["data-language"];

	return (
		<div className="my-5 flex flex-col">
			<div
				className="-ml-12 -mr-5 max-sm:-ml-4 flex justify-end overflow-x-scroll rounded-tl-global rounded-tr-global pr-5 max-sm:pr-2"
				style={style}
			>
				<span className="rounded-t-global px-2 py-1 font-mono text-zinc-400 max-sm:text-xs">
					{lang}
				</span>
			</div>
			<pre
				className="-ml-12 -mr-5 max-sm:-ml-4 overflow-x-scroll rounded-br-global rounded-bl-global p-5 text-xs max-sm:px-2 sm:text-sm max-sm:[&>code>.block>.line]:whitespace-pre-wrap"
				style={style}
			>
				<code {...code_element?.props}>
					{Children.toArray(code_element?.props.children)
						.filter((line) => line !== "\n")
						.map((line, i) => {
							// console.log({ line });
							const should_line_highlight =
								isObject(line) &&
								"props" in line &&
								(line.props["data-highlight"] ?? "false") === "true";

							return (
								<span
									// biome-ignore lint/suspicious/noArrayIndexKey: this will not change
									key={i}
									className={cn(
										"block",
										should_line_highlight &&
											"-mx-5 border-[#a86efd] border-l-4 bg-[#d0b2ff1a] px-4",
									)}
								>
									<span
										className={cn(
											"-ml-2 mr-2 hidden w-[2rem] select-none pr-2 text-right text-zinc-600 md:inline-block",
											should_line_highlight && "text-[#a86efd]",
										)}
									>
										{i + 1}
									</span>
									{line}
								</span>
							);
						})}
				</code>
			</pre>
		</div>
	);
};
